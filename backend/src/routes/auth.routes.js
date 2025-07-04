const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  logout
} = require('../controllers/auth.controller');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

// Registration validation
const registerValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('role')
    .isIn(['patient', 'donor', 'hospital'])
    .withMessage('Invalid role selected')
];

// Login validation
const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Password change validation
const passwordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Routes
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.post('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/change-password', auth, passwordValidation, validateRequest, changePassword);
router.post('/logout', auth, logout);

module.exports = router; 