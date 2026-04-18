const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create database directory if it doesn't exist
const dbPath = process.env.DB_PATH || './database/';
const dbName = process.env.DB_NAME || 'sqlite.db';
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const fullDbPath = path.join(dbPath, dbName);
console.log('Database path:', fullDbPath); // Debugging log
// Initialize database connection
const db = new sqlite3.Database(fullDbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

module.exports = db;
