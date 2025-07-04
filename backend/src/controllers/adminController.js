const Admin = require('../models/Admin');
const { createError } = require('../utils/error');
const jwt = require('jsonwebtoken');

// Create new admin
exports.createAdmin = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      throw createError(400, 'Admin with this email already exists');
    }

    // Create new admin
    const admin = new Admin({
      email,
      password,
      name,
      role
    });

    await admin.save();

    res.status(201).json({
      status: 'success',
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw createError(401, 'Invalid credentials');
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      throw createError(401, 'Invalid credentials');
    }

    // Check if admin is active
    if (!admin.isActive) {
      throw createError(403, 'Account is deactivated');
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      status: 'success',
      data: {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all admins
exports.getAllAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find().select('-password');
    res.status(200).json({
      status: 'success',
      data: {
        admins
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update admin
exports.updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) {
      throw createError(404, 'Admin not found');
    }

    // Update fields
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (role) admin.role = role;
    if (typeof isActive === 'boolean') admin.isActive = isActive;

    await admin.save();

    res.status(200).json({
      status: 'success',
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          isActive: admin.isActive
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete admin
exports.deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);
    if (!admin) {
      throw createError(404, 'Admin not found');
    }

    await admin.remove();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

exports.dashboard = async (req, res) => {
  res.json({
    message: 'Admin dashboard data',
    user: {
      id: req.user._id,
      name: req.user.firstName + ' ' + req.user.lastName,
      email: req.user.email,
      role: req.user.role
    },
    stats: {
      totalUsers: 0, // Replace with real count
      totalApplications: 0 // Replace with real count
    }
  });
};
exports.getAllUsers = async (req, res) => {
  res.json({
    users: [], // Replace with real data
    user: {
      name: req.user.firstName + ' ' + req.user.lastName
    }
  });
};
exports.updateUser = async (req, res) => {
  res.json({
    message: `User ${req.params.id} updated`,
    user: {
      name: req.user.firstName + ' ' + req.user.lastName
    }
  });
};
exports.getAllApplications = async (req, res) => {
  res.json({
    applications: [], // Replace with real data
    user: {
      name: req.user.firstName + ' ' + req.user.lastName
    }
  });
};
exports.updateApplication = async (req, res) => {
  res.json({
    message: `Application ${req.params.id} updated`,
    user: {
      name: req.user.firstName + ' ' + req.user.lastName
    }
  });
}; 