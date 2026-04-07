const db = require('../../../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static create(userData, callback) {
    const { username, email, password, first_name, last_name, phone } = userData;
    
    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return callback(err, null);
      }
      
      const query = `INSERT INTO users (username, email, password, first_name, last_name, phone) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
      
      db.run(query, [username, email, hashedPassword, first_name, last_name, phone], function(err) {
        if (err) {
          callback(err, null);
        } else {
          // Return the created user
          this.lastID;
          User.findById(this.lastID, callback);
        }
      });
    });
  }

  // Find user by ID
  static findById(id, callback) {
    const query = `SELECT id, username, email, first_name, last_name, phone, created_at, updated_at 
                   FROM users WHERE id = ?`;
    
    db.get(query, [id], (err, row) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, row);
      }
    });
  }

  // Find user by username
  static findByUsername(username, callback) {
    const query = `SELECT id, username, email, password, first_name, last_name, phone, created_at, updated_at 
                   FROM users WHERE username = ?`;
    
    db.get(query, [username], (err, row) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, row);
      }
    });
  }

  // Find user by email
  static findByEmail(email, callback) {
    const query = `SELECT id, username, email, password, first_name, last_name, phone, created_at, updated_at 
                   FROM users WHERE email = ?`;
    
    db.get(query, [email], (err, row) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, row);
      }
    });
  }

  // Update user
  static update(id, userData, callback) {
    const { username, email, first_name, last_name, phone } = userData;
    
    const query = `UPDATE users 
                   SET username = ?, email = ?, first_name = ?, last_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
                   WHERE id = ?`;
    
    db.run(query, [username, email, first_name, last_name, phone, id], function(err) {
      if (err) {
        callback(err, null);
      } else {
        // Return the updated user
        User.findById(id, callback);
      }
    });
  }

  // Delete user
  static delete(id, callback) {
    const query = `DELETE FROM users WHERE id = ?`;
    
    db.run(query, [id], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { deleted: true, id: id });
      }
    });
  }

  // Get all users with pagination, search, and filtering
  static findAll(options, callback) {
    const { page = 1, limit = 10, search = '', sort = 'id', order = 'ASC' } = options;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build search query
    let query = `SELECT id, username, email, first_name, last_name, phone, created_at, updated_at 
                 FROM users`;
    
    const params = [];
    
    if (search) {
      query += ` WHERE username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }
    
    // Add sorting
    query += ` ORDER BY ${sort} ${order}`;
    
    // Add pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    db.all(query, params, (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        // Get total count for pagination info
        let countQuery = `SELECT COUNT(*) as total FROM users`;
        const countParams = [];
        
        if (search) {
          countQuery = `SELECT COUNT(*) as total FROM users 
                        WHERE username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?`;
          const searchParam = `%${search}%`;
          countParams.push(searchParam, searchParam, searchParam, searchParam);
        }
        
        db.get(countQuery, countParams, (err, result) => {
          if (err) {
            callback(err, null);
          } else {
            callback(null, {
              users: rows,
              pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: result.total,
                pages: Math.ceil(result.total / limit)
              }
            });
          }
        });
      }
    });
  }

  // Check if user exists
  static exists(email, callback) {
    const query = `SELECT COUNT(*) as count FROM users WHERE email = ?`;
    
    db.get(query, [email], (err, row) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, row.count > 0);
      }
    });
  }
}

module.exports = User;