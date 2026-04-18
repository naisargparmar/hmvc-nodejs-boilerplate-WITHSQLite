const db = require('../../../config/database');

// Assign a permission to a role
const assignPermissionToRole = (roleId, permissionId, callback) => {
  const query = 'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)';
  db.run(query, [roleId, permissionId], function (err) {
    if (err) {
      return callback(err, null);
    }
    callback(null, { id: this.lastID, role_id: roleId, permission_id: permissionId });
  });
};

// Get all permissions assigned to a role
const getPermissionsByRole = (roleId, callback) => {
  const query = `
    SELECT rp.permission_id, p.name, p.description 
    FROM role_permissions rp 
    JOIN permissions p ON rp.permission_id = p.id 
    WHERE rp.role_id = ?
  `;
  db.all(query, [roleId], (err, rows) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, rows);
  });
};

module.exports = {
  assignPermissionToRole,
  getPermissionsByRole
};