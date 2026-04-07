const db = require('../../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class Auth {
  // Authenticate user and generate JWT token
  static authenticate(email, password, callback) {
    // Find user by email
    const query = `SELECT id, username, email, password, first_name, last_name, phone, created_at, updated_at 
                   FROM users WHERE email = ?`;
    
    db.get(query, [email], (err, user) => {
      if (err) {
        return callback(err, null);
      }
      
      if (!user) {
        return callback(null, { authenticated: false, message: 'Invalid credentials' });
      }
      
      // Compare passwords
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return callback(err, null);
        }
        
        if (!isMatch) {
          return callback(null, { authenticated: false, message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
          { 
            id: user.id, 
            username: user.username, 
            email: user.email 
          },
          process.env.JWT_SECRET || 'default_secret_key',
          { expiresIn: '24h' }
        );
        
        // Save token to database
        const tokenQuery = `INSERT INTO auth_tokens (user_id, token, expires_at) 
                            VALUES (?, ?, datetime('now', '+24 hours'))`;
        
        db.run(tokenQuery, [user.id, token], function(err) {
          if (err) {
            return callback(err, null);
          }
          
          // Return user data and token
          callback(null, {
            authenticated: true,
            token: token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              phone: user.phone,
              created_at: user.created_at
            }
          });
        });
      });
    });
  }

  // Verify JWT token
  static verifyToken(token, callback) {
    jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key', (err, decoded) => {
      if (err) {
        return callback(err, null);
      }
      
      // Check if token exists in database and is active
      const query = `SELECT id, user_id, token, created_at, expires_at, is_active 
                     FROM auth_tokens 
                     WHERE token = ? AND is_active = 1 AND expires_at > datetime('now')`;
      
      db.get(query, [token], (err, tokenData) => {
        if (err) {
          return callback(err, null);
        }
        
        if (!tokenData) {
          return callback(null, { valid: false, message: 'Invalid or expired token' });
        }
        
        callback(null, { valid: true, user: decoded });
      });
    });
  }

  // Logout user (invalidate token)
  static logout(token, callback) {
    const query = `UPDATE auth_tokens SET is_active = 0 WHERE token = ?`;
    
    db.run(query, [token], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { loggedOut: true });
      }
    });
  }

  // Refresh token
  static refreshToken(oldToken, callback) {
    Auth.verifyToken(oldToken, (err, result) => {
      if (err || !result.valid) {
        return callback(err || new Error('Invalid token'), null);
      }
      
      // Generate new token
      const newToken = jwt.sign(
        { 
          id: result.user.id, 
          username: result.user.username, 
          email: result.user.email 
        },
        process.env.JWT_SECRET || 'default_secret_key',
        { expiresIn: '24h' }
      );
      
      // Update token in database
      const updateQuery = `UPDATE auth_tokens SET token = ? WHERE token = ?`;
      db.run(updateQuery, [newToken, oldToken], function(err) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, { token: newToken });
        }
      });
    });
  }
}

module.exports = Auth;
