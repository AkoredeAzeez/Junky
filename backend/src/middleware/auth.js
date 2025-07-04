const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId, isActive: true });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
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