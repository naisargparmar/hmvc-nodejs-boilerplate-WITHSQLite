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
     console.log('Updating user with ID:', id, 'Data:', userData);
     
     const query = `UPDATE users 
                    SET first_name = ?, last_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?`;
     //Do not update username and email.
     console.log('Executing query:', query);
     db.run(query, [first_name, last_name, phone, id], function(err) {
       if (err) {
         console.error('Error updating user:', err);
         callback(err, null);
       } else {
         console.log('User updated successfully, rows affected:', this.changes);
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
    let hasWhereClause = false;
    
    // Apply scope-based filtering if req.permissionScope is available
    if (options.filters && options.filters.userId) {
      // Filter by user ID (own scope)
      if (hasWhereClause) {
        query += ` AND id = ?`;
      } else {
        query += ` WHERE id = ?`;
        hasWhereClause = true;
      }
      params.push(options.filters.userId);
    } else if (options.filters && options.filters.teamId) {
      // Filter by team ID (team scope)
      if (hasWhereClause) {
        query += ` AND team_id = ?`;
      } else {
        query += ` WHERE team_id = ?`;
        hasWhereClause = true;
      }
      params.push(options.filters.teamId);
    }
    
    // Apply search filtering
    if (search) {
      if (hasWhereClause) {
        query += ` AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
      } else {
        query += ` WHERE (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
        hasWhereClause = true;
      }
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
        let countHasWhereClause = false;
        
        // Apply same filters for count query
        if (options.filters && options.filters.userId) {
          countQuery += ` WHERE id = ?`;
          countHasWhereClause = true;
          countParams.push(options.filters.userId);
        } else if (options.filters && options.filters.teamId) {
          countQuery += ` WHERE team_id = ?`;
          countHasWhereClause = true;
          countParams.push(options.filters.teamId);
        }
        
        // Apply search to count query too
        if (search) {
          if (countHasWhereClause) {
            countQuery += ` AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
          } else {
            countQuery += ` WHERE (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
            countHasWhereClause = true;
          }
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