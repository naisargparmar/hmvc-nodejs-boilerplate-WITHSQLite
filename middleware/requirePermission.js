// const { determineScope } = require('./scopeValidation');

const requirePermission = (permission) => {
  return async (req, res, next) => {
    // console.log(`Checking permission: ${permission} for user:`, req.user, req.permissionsDetailed); // Debugging log
    console.log(`Checking permission: ${permission}`); // Debugging log
    console.log('req.user:', req.user); // Debugging log
    // Check if user has super_admin role - if so, skip all checks
    if (req.user && req.user.role === 'super_admin') {
      // Skip filters for super_admin
      req.permissionScope = 'any';
      return next();
    }

    // Check if the user has the required permission
    // console.log('req.permissionsDetailed:', req.permissionsDetailed); // Debugging log
    if (!req.permissionsDetailed || !Array.isArray(req.permissionsDetailed)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: missing permission"
      });
    }
    
    // Parse the requested permission
    const [resource, action, scope] = permission.split(':');
    
    // Check if the user has the required permission
    const hasPermission = req.permissionsDetailed.some(userPermission => {
      // Check if resource and action match
      if (userPermission.resource === resource && userPermission.action === action) {
        return true; // Exact match of resource and action, scope will be checked separately
        // // If we're looking for an unscoped permission (no scope) and user has a scoped permission
        // // (e.g., user:read request matches user:read:team permission), it should match
        // if (!scope && userPermission.scope) {
        //   // User has a scoped permission, which can satisfy unscoped request
        //   return true;
        // }
        
        // // If we're looking for a scoped permission and user has an unscoped permission
        // // (e.g., user:read:team request does NOT match user:read permission), it should NOT match
        // if (scope && !userPermission.scope) {
        //   // User has an unscoped permission, which cannot satisfy scoped request
        //   return false;
        // }
        
        // // If we're looking for a scoped permission and user has a scoped permission
        // if (scope && userPermission.scope) {
        //   // Exact match of scope
        //   if (userPermission.scope === scope) {
        //     return true;
        //   }
          
        //   // Check if user has a broader scope that can satisfy this request
        //   // or user has 'any' scope which can satisfy any specific scope
        //   if (userPermission.scope === 'any') {
        //     return true;
        //   }
        // }
        
        // // If we're looking for an unscoped permission and user has an unscoped permission
        // if (!scope && !userPermission.scope) {
        //   return true;
        // }
      }
      
      return false;
    });
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: missing permission"
      });
    }
    
    // // Determine the best matching scope based on priority: any > team > own
    // const matchedScope = determineScope(req, resource, action, scope);
    
    // req.permissionScope = matchedScope;
    
    return next();
  };
};

module.exports = requirePermission;
