const db = require('../../../config/database');

// Create a new permission
const createPermission = (name, description, callback) => {
  const query = 'INSERT INTO permissions (name, description) VALUES (?, ?)';
  db.run(query, [name, description], function (err) {
    if (err) {
      return callback(err, null);
    }
    callback(null, { id: this.lastID, name, description });
  });
};

// Get all permissions
const getAllPermissions = (callback) => {
  const query = 'SELECT * FROM permissions';
  db.all(query, [], (err, rows) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, rows);
  });
};

module.exports = {
  createPermission,
  getAllPermissions
};