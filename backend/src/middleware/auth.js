const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const auth = async (req, res, next) => {
  try {
    console.log('Headers:', req.headers);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Extracted token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      console.log('No token found');
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    let user;
    
    // Handle different token formats
    if (decoded.role) {
      // Admin token format (has 'id' and 'role')
      if (decoded.role === 'admin' || decoded.role === 'super_admin') {
        user = await Admin.findOne({ _id: decoded.id, isActive: true });
      } else {
        user = await User.findOne({ _id: decoded.id, isActive: true });
      }
    } else if (decoded.userId) {
      // User token format (has 'userId' but no 'role')
      user = await User.findOne({ _id: decoded.userId, isActive: true });
    }
    
    console.log('Found user:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('User not found in database');
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.log('Auth error:', error.message);
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

// Alias for auth function
const protect = auth;

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'You do not have permission to perform this action.' 
      });
    }
    next();
  };
};

const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'You do not have permission to perform this action.' 
      });
    }
    next();
  };
};

const verifyEmail = async (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({ 
      error: 'Please verify your email address before proceeding.' 
    });
  }
  next();
};

module.exports = {
  auth,
  protect,
  restrictTo,
  checkRole,
  verifyEmail
}; 