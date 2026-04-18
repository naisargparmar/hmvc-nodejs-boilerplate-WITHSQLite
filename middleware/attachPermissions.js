const db = require('../config/database.js');

const attachPermissions = async (req, res, next) => {
  try {
    // Check if user exists in request
    // console.log('userRoles:', req.userRoles); // Debugging log
    console.log('userRoleName:', req.userRoleName); // Debugging log
    // console.log('userDetails:', req.userDetails); // Debugging log
    // console.log('Attaching permissions for user:', req.userRoles); // Debugging log
    if (!req.user || !req.user.id) {
      req.permissions = [];
      req.permissionsDetailed = [];
      return next();
    }

    const userId = req.user.id;

    // SQL query to fetch all permissions for a user
    const query = `
      SELECT DISTINCT p.name
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = ?
    `;

    // Use db.all() with proper async/await handling
    const rows = await new Promise((resolve, reject) => {
      db.all(query, [userId], (err, rows) => {
        if (err) {
          console.error('Database error in attachPermissions:', err);
          resolve([]); // Return empty array on error
        } else {
          resolve(rows);
        }
      });
    });
    
    // console.log('Fetched permissions from database:', rows); // Debugging log
    const permissions = rows.map(row => row.name);
    // console.log('Mapped permissions:', permissions); // Debugging log

    // Convert flat permission strings to structured permissions with scopes
    const permissionsDetailed = permissions.map(permission => {
      // Handle backward compatibility: if permission doesn't have scope, treat as "any"
      if (!permission.includes(':')) {
        return {
          resource: permission,
          action: 'any', // This is a placeholder - actual action will be determined by the permission
          scope: 'any'
        };
      }
      
      // Parse structured permissions
      const [resource, action, scope] = permission.split(':');
      return {
        resource,
        action,
        scope
      };
    });

    console.log('User\'s permissionsDetailed:', permissionsDetailed); // Debugging log
    // [
    //   { resource: 'user', action: 'read', scope: 'own' },
    //   { resource: 'user', action: 'update', scope: 'own' },
    //   { resource: 'auth', action: 'logout', scope: 'own' }
    // ]
    // console.log('User\'s permissions:', permissions); // Debugging log
    req.permissions = permissions;
    req.permissionsDetailed = permissionsDetailed;
    next();
  } catch (error) {
    // In case of any error, return empty array to avoid blocking the request
    console.error('Error fetching user permissions:', error);
    req.permissions = [];
    req.permissionsDetailed = [];
    next();
  }
};

module.exports = attachPermissions;
