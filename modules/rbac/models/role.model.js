const db = require('../../../config/database');

// Create a new role
const createRole = (name, description, callback) => {
  const query = 'INSERT INTO roles (name, description) VALUES (?, ?)';
  db.run(query, [name, description], function (err) {
    if (err) {
      return callback(err, null);
    }
    callback(null, { id: this.lastID, name, description });
  });
};

// Get all roles
const getAllRoles = (callback) => {
  const query = 'SELECT * FROM roles';
  db.all(query, [], (err, rows) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, rows);
  });
};

// Get role by ID
const getRoleById = (id, callback) => {
  const query = 'SELECT * FROM roles WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, row);
  });
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById
};