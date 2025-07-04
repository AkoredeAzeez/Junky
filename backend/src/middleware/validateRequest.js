const { validationResult } = require('express-validator');
const { createError } = require('../utils/error');

exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw createError(400, errorMessages.join(', '));
  }
  next();
}; 