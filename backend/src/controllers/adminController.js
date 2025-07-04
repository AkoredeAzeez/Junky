const Admin = require('../models/Admin');
const { createError } = require('../utils/error');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Application = require('../models/Application');
const Donor = require('../models/Donor');

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
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalHospitals = await User.countDocuments({ role: 'hospital' });
    const totalApplications = await Application.countDocuments();
    res.json({
      message: 'Admin dashboard data',
      user: {
        id: req.user._id,
        name: req.user.name, // Use the correct name field for admin
        email: req.user.email,
        role: req.user.role
      },
      stats: {
        totalUsers,
        totalDonors,
        totalPatients,
        totalHospitals,
        totalApplications
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.getAllDonors = async (req, res) => {
  try {
    // If donors are in User collection by role
    const donors = await User.find({ role: 'donor' }).select('-password');
    res.json({ donors });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch donors' });
  }
};

exports.getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json({ patients });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find().populate('patient', '-password');
    res.json({ applications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // status: 'approved' or 'rejected'
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    if (status && ['approved', 'rejected', 'pending'].includes(status)) {
      application.status = status;
      application.updatedAt = new Date();
      await application.save();
      return res.json({ message: `Application ${id} status updated to ${status}`, application });
    }
    res.status(400).json({ error: 'Invalid or missing status' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application' });
  }
};

exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await User.find({ role: 'hospital' }).select('-password');
    res.json({ hospitals });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
}; 