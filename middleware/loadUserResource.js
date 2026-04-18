const User = require('../modules/user/models/user.model');
const UserRole = require('../modules/rbac/models/userRole.model');

// Middleware to load user details and role information
const loadUserResource = (req, res, next) => {
  if (req.user && req.user.id) {
    // Fetch user details
    User.findById(req.user.id, (err, user) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({
          success: false,
          error: 'Error fetching user details'
        });
      }
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      // Fetch user roles
      UserRole.getUserRoles(req.user.id, (err, roles) => {
        if (err) {
          console.error('Error fetching user roles:', err);
          return res.status(500).json({
            success: false,
            error: 'Error fetching user roles'
          });
        }
        
        // Attach user details and roles to request object
        req.userDetails = user;
        req.userRoles = roles;
        
        // If user has roles, attach the first role name (or all roles)
        if (roles && roles.length > 0) {
          req.userRoleName = roles[0].name; // Get the first role name
        } else {
          req.userRoleName = null; // No role assigned
        }
        req.user.role = req.userRoleName; // Attach role name to req.user for easier access in permissions
        
        next();
      });
    });
  } else {
    // If no user in token, proceed without loading user details
    next();
  }
};

module.exports = loadUserResource;