const bcrypt = require('bcryptjs');

/**
 * Seed RBAC data into the database
 * @param {Object} db - Database connection instance
 */
async function seedRBAC(db) {
  return new Promise((resolve, reject) => {
    // Begin transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION', async (err) => {
        if (err) {
          return reject(err);
        }

        try {
          // Seed permissions
          console.log('✔ Seeding permissions');
const scopes = ['own', 'team', 'org', 'any'];

function generateScoped(resource, actions) {
  const result = [];
  for (const action of actions) {
    for (const scope of scopes) {
      result.push(`${resource}:${action}:${scope}`);
    }
  }
  return result;
}

const permissions = [
  // USER (scoped)
  ...generateScoped('user', ['read', 'update', 'delete']),
  'user:create:any',

  // ROLE (mostly global)
  'role:create:any',
  'role:read:any',
  'role:update:any',
  'role:delete:any',

  // PERMISSION (admin only)
  'permission:create:any',
  'permission:read:any',
  'permission:update:any',
  'permission:delete:any',

  // AUTH
  'auth:login',
  'auth:logout:own',
  'auth:logout:any',

  // USER-ROLE
  'user_role:assign:any',
  'user_role:remove:any',
  'user_role:read:any',

  // ROLE-PERMISSION
  'role_permission:assign:any',
  'role_permission:remove:any',
  'role_permission:read:any',

  // OPTIONAL: TEAM / ORG (safe to include even if unused)
  ...generateScoped('team', ['read', 'update', 'delete']),
  'team:create:any',

  ...generateScoped('org', ['read', 'update']),
  'org:create:any',
  'org:delete:any'
];

const legacyPermissions = [
    'user:create', 'user:read', 'user:update', 'user:delete',
    'role:create', 'role:read', 'role:update', 'role:delete'
  ];

  permissions.push(...legacyPermissions);

          for (const permission of permissions) {
            await new Promise((resolve, reject) => {
              db.run(
                `INSERT OR IGNORE INTO permissions (name) VALUES (?)`,
                [permission],
                function(err) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve();
                  }
                }
              );
            });
          }

          // Seed roles
          console.log('✔ Seeding roles');
          const roles = [
            'super_admin', 'admin', 'manager', 'user', 'guest'
          ];

          for (const role of roles) {
            await new Promise((resolve, reject) => {
              db.run(
                `INSERT OR IGNORE INTO roles (name) VALUES (?)`,
                [role],
                function(err) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve();
                  }
                }
              );
            });
          }

          // Get role and permission IDs for mapping
          const roleIds = {};
          const permissionIds = {};

          // Get role IDs
          const roleRows = await new Promise((resolve, reject) => {
            db.all('SELECT id, name FROM roles', (err, rows) => {
              if (err) {
                reject(err);
              } else {
                resolve(rows);
              }
            });
          });
          roleRows.forEach(row => {
            roleIds[row.name] = row.id;
          });

          // Get permission IDs
          const permissionRows = await new Promise((resolve, reject) => {
            db.all('SELECT id, name FROM permissions', (err, rows) => {
              if (err) {
                reject(err);
              } else {
                resolve(rows);
              }
            });
          });
          permissionRows.forEach(row => {
            permissionIds[row.name] = row.id;
          });

          // Map permissions to roles
          console.log('✔ Mapping permissions to roles');
          
          // super_admin → all permissions
          const superAdminPermissions = permissions;
          for (const perm of superAdminPermissions) {
            if (permissionIds[perm]) {
              db.run(
                `INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
                [roleIds['super_admin'], permissionIds[perm]],
                (err) => {
                  if (err) {
                    throw err;
                  }
                }
              );
            }
          }

          // admin → all except permission:delete
          const adminPermissions = permissions.filter(p =>
            !p.startsWith('permission:delete') &&
            !p.startsWith('org:delete')
          );
          for (const perm of adminPermissions) {
            if (permissionIds[perm]) {
              db.run(
                `INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
                [roleIds['admin'], permissionIds[perm]],
                (err) => {
                  if (err) {
                    throw err;
                  }
                }
              );
            }
          }

          // manager → user:read, user:update, role:read
          const managerPermissions = [
            'user:read:team',
            'user:update:team',
            'user:delete:team',
            'role:read:any',
            'team:read:org'
          ];
          for (const perm of managerPermissions) {
            if (permissionIds[perm]) {
              db.run(
                `INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
                [roleIds['manager'], permissionIds[perm]],
                (err) => {
                  if (err) {
                    throw err;
                  }
                }
              );
            }
          }

          // user → user:read
          const userPermissions = [
            'user:read:own',
            'user:update:own',
            'auth:logout:own'
          ];
          for (const perm of userPermissions) {
            if (permissionIds[perm]) {
              db.run(
                `INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
                [roleIds['user'], permissionIds[perm]],
                (err) => {
                  if (err) {
                    throw err;
                  }
                }
              );
            }
          }

          // guest → auth:login
          const guestPermissions = [
            'auth:login'
          ];
          for (const perm of guestPermissions) {
            if (permissionIds[perm]) {
              db.run(
                `INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
                [roleIds['guest'], permissionIds[perm]],
                (err) => {
                  if (err) {
                    throw err;
                  }
                }
              );
            }
          }

          // Create admin user
          console.log('✔ Creating admin user');
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash('admin123', saltRounds);
          
          db.run(
            `INSERT OR IGNORE INTO users (username, email, password) VALUES (?, ?, ?)`,
            ['super_admin', 'super_admin@example.com', hashedPassword],
            async function(err) {
              if (err) {
                return reject(err);
              }

              // Get the user ID of the admin user
              const userId = this.lastID;
              
              // Assign super_admin role to admin user
              db.run(
                `INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`,
                [userId, roleIds['super_admin']],
                (err) => {
                  if (err) {
                    return reject(err);
                  }

                  // Create additional users with their roles
                  console.log('✔ Creating additional users');
                  
                  // Create admin user
                  const adminHashedPassword = bcrypt.hashSync('admin123', saltRounds);
                  db.run(
                    `INSERT OR IGNORE INTO users (username, email, password) VALUES (?, ?, ?)`,
                    ['admin', 'admin@example.com', adminHashedPassword],
                    function(err) {
                      if (err) {
                        return reject(err);
                      }

                      // Get the user ID of the admin user
                      const adminUserId = this.lastID;
                      
                      // Assign admin role to admin user
                      db.run(
                        `INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`,
                        [adminUserId, roleIds['admin']],
                        (err) => {
                          if (err) {
                            return reject(err);
                          }

                          // Create manager user
                          const managerHashedPassword = bcrypt.hashSync('admin123', saltRounds);
                          db.run(
                            `INSERT OR IGNORE INTO users (username, email, password) VALUES (?, ?, ?)`,
                            ['manager', 'manager@example.com', managerHashedPassword],
                            function(err) {
                              if (err) {
                                return reject(err);
                              }

                              // Get the user ID of the manager user
                              const managerUserId = this.lastID;
                              
                              // Assign manager role to manager user
                              db.run(
                                `INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`,
                                [managerUserId, roleIds['manager']],
                                (err) => {
                                  if (err) {
                                    return reject(err);
                                  }

                                  // Create user user
                                  const userHashedPassword = bcrypt.hashSync('admin123', saltRounds);
                                  db.run(
                                    `INSERT OR IGNORE INTO users (username, email, password) VALUES (?, ?, ?)`,
                                    ['user', 'user@example.com', userHashedPassword],
                                    function(err) {
                                      if (err) {
                                        return reject(err);
                                      }

                                      // Get the user ID of the user user
                                      const userId = this.lastID;
                                      
                                      // Assign user role to user user
                                      db.run(
                                        `INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`,
                                        [userId, roleIds['user']],
                                        (err) => {
                                          if (err) {
                                            return reject(err);
                                          }

                                          // Create guest user
                                          const guestHashedPassword = bcrypt.hashSync('admin123', saltRounds);
                                          db.run(
                                            `INSERT OR IGNORE INTO users (username, email, password) VALUES (?, ?, ?)`,
                                            ['guest', 'guest@example.com', guestHashedPassword],
                                            function(err) {
                                              if (err) {
                                                return reject(err);
                                              }

                                              // Get the user ID of the guest user
                                              const guestUserId = this.lastID;
                                              
                                              // Assign guest role to guest user
                                              db.run(
                                                `INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`,
                                                [guestUserId, roleIds['guest']],
                                                (err) => {
                                                  if (err) {
                                                    return reject(err);
                                                  }

                                                  // Commit transaction
                                                  db.run('COMMIT', (err) => {
                                                    if (err) {
                                                      return reject(err);
                                                    }
                                                    console.log('✔ Done');
                                                    resolve();
                                                  });
                                                }
                                              );
                                            }
                                          );
                                        }
                                      );
                                    }
                                  );
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        } catch (error) {
          // Rollback transaction on error
          db.run('ROLLBACK', (err) => {
            if (err) {
              console.error('Error rolling back transaction:', err.message);
            }
          });
          reject(error);
        }
      });
    });
  });
}

module.exports = { seedRBAC };