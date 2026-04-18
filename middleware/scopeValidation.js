/**
 * Determine the best matching scope based on priority: any > team > own
 * @param {Object} req - Express request object
 * @param {string} resource - The resource being accessed
 * @param {string} action - The action being performed
 * @param {string} scope - The requested scope (optional)
 * @returns {string} The matched scope
 */
const determineScope = (req, resource, action, scope) => {
  let matchedScope = null;
  
  if (scope) {
    // If a scope was requested, find the best matching scope the user has
    const userScopes = req.permissionsDetailed
      .filter(p => p.resource === resource && p.action === action)
      .map(p => p.scope)
      .filter(s => s !== null && s !== undefined);
    
    // Priority: any > team > own
    if (userScopes.includes('any')) {
      matchedScope = 'any';
    } else if (userScopes.includes('team')) {
      matchedScope = 'team';
    } else if (userScopes.includes('own')) {
      matchedScope = 'own';
    }
  } else {
    // If no scope was requested, check if user has any scoped permission
    const userScopes = req.permissionsDetailed
      .filter(p => p.resource === resource && p.action === action)
      .map(p => p.scope)
      .filter(s => s !== null && s !== undefined);
    
    if (userScopes.includes('any')) {
      matchedScope = 'any';
    } else if (userScopes.includes('team')) {
      matchedScope = 'team';
    } else if (userScopes.includes('own')) {
      matchedScope = 'own';
    } else {
      // If no specific scope found, default to 'own' for backward compatibility
      matchedScope = 'own';
    }
  }
  
  return matchedScope;
};

module.exports = { determineScope };