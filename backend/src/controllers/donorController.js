const Donor = require('../models/Donor');
const { createError } = require('../utils/error');
const jwt = require('jsonwebtoken');
const Donation = require('../models/Donation');
const Application = require('../models/Application');

// Register new donor
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      type,
      organizationName,
      taxId
    } = req.body;

    // Check if donor already exists
    const existingDonor = await Donor.findOne({ email });
    if (existingDonor) {
      throw createError(400, 'Donor with this email already exists');
    }

    // Create new donor
    const donor = new Donor({
      name,
      email,
      password,
      phone,
      address,
      type,
      organizationName,
      taxId
    });

    await donor.save();

    res.status(201).json({
      status: 'success',
      data: {
        donor: {
          id: donor._id,
          name: donor.name,
          email: donor.email,
          type: donor.type
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Donor login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find donor
    const donor = await Donor.findOne({ email });
    if (!donor) {
      throw createError(401, 'Invalid credentials');
    }

    // Check password
    const isPasswordValid = await donor.comparePassword(password);
    if (!isPasswordValid) {
      throw createError(401, 'Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: donor._id, role: 'donor' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      status: 'success',
      data: {
        token,
        donor: {
          id: donor._id,
          name: donor.name,
          email: donor.email,
          type: donor.type
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.makeDonation = async (req, res, next) => {
  try {
    const { amount, patientId, applicationId, paymentMethod } = req.body;
    const donation = await Donation.create({
      donor: req.user._id,
      patient: patientId,
      application: applicationId,
      amount,
      paymentMethod,
      status: 'completed'
    });
    res.status(201).json({
      message: 'Donation made',
      donation,
      user: { name: req.user.firstName + ' ' + req.user.lastName }
    });
  } catch (error) {
    next(error);
  }
};

// Get donor profile
exports.getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const donor = await Donor.findById(id)
      .select('-password')
      .populate('donations.campaign')
      .populate('donations.patient')
      .populate('donations.hospital');

    if (!donor) {
      throw createError(404, 'Donor not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        donor
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update donor profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      address,
      preferences
    } = req.body;

    const donor = await Donor.findById(id);
    if (!donor) {
      throw createError(404, 'Donor not found');
    }

    // Update fields
    if (name) donor.name = name;
    if (phone) donor.phone = phone;
    if (address) donor.address = address;
    if (preferences) donor.preferences = { ...donor.preferences, ...preferences };

    await donor.save();

    res.status(200).json({
      status: 'success',
      data: {
        donor: {
          id: donor._id,
          name: donor.name,
          email: donor.email,
          phone: donor.phone,
          address: donor.address,
          preferences: donor.preferences
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get donation history
exports.getDonationHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const donor = await Donor.findById(id)
      .select('donations')
      .populate('donations.campaign')
      .populate('donations.patient')
      .populate('donations.hospital');

    if (!donor) {
      throw createError(404, 'Donor not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        donations: donor.donations
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.dashboard = async (req, res) => {
  res.json({
    message: 'Donor dashboard data',
    user: {
      id: req.user._id,
      name: req.user.firstName + ' ' + req.user.lastName,
      email: req.user.email,
      role: req.user.role
    },
    stats: {
      donationsMade: 0, // Replace with real count
      patientsHelped: 0 // Replace with real count
    }
  });
};
exports.getCases = async (req, res, next) => {
  try {
    // Fetch all applications and populate patient details
    const cases = await Application.find({ status: 'pending' })
      .populate('patient', 'firstName lastName email');
    res.json({
      cases,
      user: {
        name: req.user.firstName + ' ' + req.user.lastName
      }
    });
  } catch (error) {
    next(error);
  }
};
exports.getDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ donor: req.user._id });
    res.json({
      donations,
      user: { name: req.user.firstName + ' ' + req.user.lastName }
    });
  } catch (error) {
    next(error);
  }
}; 