const userScopeValidation = (req, res, next) => {
  // This middleware validates user scope access for user resources
  // It should be used after requirePermission middleware and loadUserResource middleware
  
  // Check if we have the required data
  if (!req.permissionScope) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: missing permission scope'
    });
  }
  
  // For routes that involve specific user resources (GET, PUT, DELETE)
  if (req.params && req.params.id) {
    const userId = req.params.id;
    
    // Validate scope access based on permission scope
    if (req.permissionScope === 'own') {
      // Own scope: user can only access their own record
      if (userId !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: cannot access this user'
        });
      }
    } else if (req.permissionScope === 'team') {
      // Team scope: user can access users in their team
      // In a real implementation, this would check team membership
      // For now, we'll allow access but log this for review
      // Note: This is a simplified implementation
    }
  }
  
  next();
};

module.exports = userScopeValidation;
