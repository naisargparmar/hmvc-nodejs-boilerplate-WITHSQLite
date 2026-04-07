// Simple test to verify API structure
const fs = require('fs');
const path = require('path');

describe('API Structure', () => {
  test('should have all required directories', () => {
    const directories = [
      'config',
      'modules/user/models',
      'modules/user/routes',
      'modules/auth/models',
      'modules/auth/routes',
      'test'
    ];

    directories.forEach(dir => {
      const dirPath = path.join(__dirname, '..', dir);
      expect(fs.existsSync(dirPath)).toBe(true);
    });
  });

  test('should have required files', () => {
    const files = [
      'server.js',
      'config/database.js',
      'modules/user/models/user.model.js',
      'modules/auth/models/auth.model.js',
      'modules/user/routes/user.routes.js',
      'modules/auth/routes/auth.routes.js',
      '.env',
      'package.json',
      'init.js'
    ];

    files.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('should have proper package.json dependencies', () => {
    const packageJson = require('../package.json');
    const requiredDependencies = [
      'express',
      'sqlite3',
      'jsonwebtoken',
      'helmet',
      'cors',
      'express-rate-limit',
      'swagger-jsdoc',
      'swagger-ui-express',
      'dotenv',
      'joi'
    ];

    requiredDependencies.forEach(dep => {
      expect(packageJson.dependencies).toHaveProperty(dep);
    });
  });
});
