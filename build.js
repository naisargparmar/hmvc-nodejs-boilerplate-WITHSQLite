const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Detect entry point automatically
const entryPoints = ['index.js', 'app.js', 'server.js'];
let entryPoint = 'server.js'; // default

for (const file of entryPoints) {
  if (fs.existsSync(file)) {
    entryPoint = file;
    break;
  }
}

console.log(`Detected entry point: ${entryPoint}`);

// Build configuration
const config = {
  entryPoints: [entryPoint],
  bundle: true,
  platform: 'node',
  target: 'node22',
  outfile: 'dist/app.js',
  minify: true,
  sourcemap: true,
  external: [
    'swagger-ui-dist',
    'swagger-ui-express',
    'sqlite3'
  ],
  format: 'cjs',
  logLevel: 'info'
};

// Check if watch mode is enabled
const watch = process.argv.includes('--watch');

if (watch) {
  console.log('Starting watch mode...');
  // For esbuild 0.28.0, we need to use a different approach for watch mode
  const { build } = require('esbuild');
  build(config)
    .then(() => {
      // Watch mode implementation for esbuild 0.28.0
      const chokidar = require('chokidar');
      const watcher = chokidar.watch('.', {
        ignored: ['node_modules', 'dist', '.git'],
        persistent: true
      });
      
      watcher.on('change', () => {
        console.log('Change detected, rebuilding...');
        build(config)
          .catch(() => process.exit(1));
      });
    })
    .catch(() => process.exit(1));
} else {
  esbuild.build(config)
    .catch(() => process.exit(1));
}
