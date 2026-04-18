const db = require('../../../config/database');

// Assign a role to a user
const assignRoleToUser = (userId, roleId, callback) => {
  const query = 'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)';
  db.run(query, [userId, roleId], function (err) {
    if (err) {
      return callback(err, null);
    }
    callback(null, { id: this.lastID, user_id: userId, role_id: roleId });
  });
};

// Get all roles assigned to a user
const getUserRoles = (userId, callback) => {
  const query = `
    SELECT r.id as role_id, r.name, r.description 
    FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = ?
  `;
  db.all(query, [userId], (err, rows) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, rows);
  });
};

module.exports = {
  assignRoleToUser,
  getUserRoles
};