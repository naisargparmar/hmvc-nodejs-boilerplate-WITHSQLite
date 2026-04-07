// Initialize the database and create required directories
const fs = require('fs');
const path = require('path');

// Create database directory if it doesn't exist
const dbDir = './database';
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Created database directory');
}

// Create a simple README for the database
const dbReadmePath = path.join(dbDir, 'README.md');
if (!fs.existsSync(dbReadmePath)) {
  fs.writeFileSync(dbReadmePath, '# Database Directory\n\nThis directory contains the SQLite database files for the Booking API.');
  console.log('Created database README.md');
}

console.log('Database initialization complete!');