const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Get user profile
router.get('/profile', protect, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// Update user profile
router.patch('/profile', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Profile updated successfully'
  });
});

module.exports = router; 