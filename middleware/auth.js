const jwt = require('jsonwebtoken');
const loadUserResource = require('./loadUserResource');

// Middleware for authentication
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }
  console.log('Received token:', token); // Debugging log
  jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key', (err, user) => {
    if (err) {
      console.log('Token verification error:', err); // Debugging log
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    console.log('Token verified successfully:', user); // Debugging log
    req.user = user;
    // Load user details and roles after successful authentication
    loadUserResource(req, res, next);
  });
  // console.log('Token verification completed'); // Debugging log
};

module.exports = authMiddleware;
