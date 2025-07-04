const Hospital = require('../models/Hospital');
const { createError } = require('../utils/error');
const { upload, handleUploadError } = require('../utils/fileUpload');

// Register new hospital
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      address,
      phone,
      licenseNumber,
      specialization,
      bedCapacity
    } = req.body;

    // Check if hospital already exists
    const existingHospital = await Hospital.findOne({ 
      $or: [{ email }, { licenseNumber }] 
    });
    if (existingHospital) {
      throw createError(400, 'Hospital with this email or license number already exists');
    }

    // Create new hospital
    const hospital = new Hospital({
      name,
      email,
      password,
      address,
      phone,
      licenseNumber,
      specialization,
      bedCapacity,
      availableBeds: bedCapacity
    });

    await hospital.save();

    res.status(201).json({
      status: 'success',
      data: {
        hospital: {
          id: hospital._id,
          name: hospital.name,
          email: hospital.email,
          licenseNumber: hospital.licenseNumber
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.dashboard = async (req, res) => {
  res.json({
    message: 'Hospital dashboard data',
    user: {
      id: req.user._id,
      name: req.user.firstName + ' ' + req.user.lastName,
      email: req.user.email,
      role: req.user.role
    },
    stats: {
      applications: 0, // Replace with real count
      patientsManaged: 0 // Replace with real count
    }
  });
};
exports.getApplications = async (req, res) => {
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
exports.uploadDocuments = async (req, res) => {
  res.json({
    message: 'Documents uploaded',
    user: {
      name: req.user.firstName + ' ' + req.user.lastName
    }
  });
};

// Update hospital profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      phone,
      specialization,
      bedCapacity
    } = req.body;

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      throw createError(404, 'Hospital not found');
    }

    // Update fields
    if (name) hospital.name = name;
    if (address) hospital.address = address;
    if (phone) hospital.phone = phone;
    if (specialization) hospital.specialization = specialization;
    if (bedCapacity) {
      hospital.bedCapacity = bedCapacity;
      hospital.availableBeds = bedCapacity - (hospital.bedCapacity - hospital.availableBeds);
    }

    await hospital.save();

    res.status(200).json({
      status: 'success',
      data: {
        hospital: {
          id: hospital._id,
          name: hospital.name,
          email: hospital.email,
          address: hospital.address,
          phone: hospital.phone,
          specialization: hospital.specialization,
          bedCapacity: hospital.bedCapacity,
          availableBeds: hospital.availableBeds
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get hospital details
exports.getHospital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findById(id)
      .select('-password')
      .populate('reviews.patient', 'name');

    if (!hospital) {
      throw createError(404, 'Hospital not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        hospital
      }
    });
  } catch (error) {
    next(error);
  }
};

// List all hospitals
exports.listHospitals = async (req, res, next) => {
  try {
    const { 
      specialization,
      city,
      hasAvailableBeds,
      minRating
    } = req.query;

    // Build query
    const query = {};
    if (specialization) {
      query.specialization = { $in: [specialization] };
    }
    if (city) {
      query['address.city'] = city;
    }
    if (hasAvailableBeds === 'true') {
      query.availableBeds = { $gt: 0 };
    }
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    const hospitals = await Hospital.find(query)
      .select('-password')
      .sort({ rating: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        hospitals
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add hospital review
exports.addReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const patientId = req.user.id; // From auth middleware

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      throw createError(404, 'Hospital not found');
    }

    // Add review
    hospital.reviews.push({
      patient: patientId,
      rating,
      comment
    });

    // Update average rating
    const totalRating = hospital.reviews.reduce((sum, review) => sum + review.rating, 0);
    hospital.rating = totalRating / hospital.reviews.length;

    await hospital.save();

    res.status(200).json({
      status: 'success',
      data: {
        reviews: hospital.reviews
      }
    });
  } catch (error) {
    next(error);
  }
}; 