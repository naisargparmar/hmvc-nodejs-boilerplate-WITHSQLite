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
  external: ['node_modules/*'],
  format: 'cjs',
  logLevel: 'info'
};

// Check if watch mode is enabled
const watch = process.argv.includes('--watch');

if (watch) {
  console.log('Starting watch mode...');
  esbuild.watch(config)
    .catch(() => process.exit(1));
} else {
  esbuild.build(config)
    .catch(() => process.exit(1));
}