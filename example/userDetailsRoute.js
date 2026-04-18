const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const loadUserResource = require('../middleware/loadUserResource');

// Example route that uses the loaded user details
router.get('/profile', [authMiddleware, loadUserResource], (req, res) => {
  // Now we can access user details and role information
  if (req.userDetails) {
    const response = {
      success: true,
      user: {
        id: req.userDetails.id,
        username: req.userDetails.username,
        email: req.userDetails.email,
        first_name: req.userDetails.first_name,
        last_name: req.userDetails.last_name,
        role: req.userRoleName // This contains the role name
      }
    };
    
    res.json(response);
  } else {
    res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
});

module.exports = router;