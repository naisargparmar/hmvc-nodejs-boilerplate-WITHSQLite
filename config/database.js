const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create database directory if it doesn't exist
const dbPath = process.env.DB_PATH || './database/booking.db';
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables if they don't exist
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table ready');
    }
  });

  // Auth tokens table
  db.run(`CREATE TABLE IF NOT EXISTS auth_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error('Error creating auth_tokens table:', err.message);
    } else {
      console.log('Auth tokens table ready');
    }
  });

  // Create indexes for better performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`, (err) => {
    if (err) {
      console.error('Error creating index for users email:', err.message);
    }
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token)`, (err) => {
    if (err) {
      console.error('Error creating index for auth_tokens token:', err.message);
    }
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id)`, (err) => {
    if (err) {
      console.error('Error creating index for auth_tokens user_id:', err.message);
    }
  });
});

module.exports = db;