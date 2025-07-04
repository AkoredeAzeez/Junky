const Application = require('../models/Application');

exports.dashboard = async (req, res) => {
  res.json({
    message: 'Patient dashboard data',
    user: {
      id: req.user._id,
      name: req.user.firstName + ' ' + req.user.lastName,
      email: req.user.email,
      role: req.user.role
    },
    stats: {
      applications: 0, // Replace with real count
      donationsReceived: 0 // Replace with real count
    }
  });
};

exports.getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ patient: req.user._id });
    res.json({
      applications,
      user: {
        name: req.user.firstName + ' ' + req.user.lastName
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createApplication = async (req, res, next) => {
  try {
    const { title, amount, urgency } = req.body;
    const documents = req.files ? req.files.map(file => file.path) : [];

    const application = await Application.create({
      patient: req.user._id,
      title,
      amount,
      urgency,
      documents
    });

    res.status(201).json({
      message: 'New application created',
      application,
      user: {
        name: req.user.firstName + ' ' + req.user.lastName
      }
    });
  } catch (error) {
    next(error);
  }
};
exports.getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      patient: req.user._id
    });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({
      application,
      user: {
        name: req.user.firstName + ' ' + req.user.lastName
      }
    });
  } catch (error) {
    next(error);
  }
};
exports.updateApplication = async (req, res) => {
  res.json({
    message: `Application ${req.params.id} updated`,
    user: {
      name: req.user.firstName + ' ' + req.user.lastName
    }
  });
};
exports.getDonations = async (req, res) => {
  res.json({
    donations: [], // Replace with real data
    user: {
      name: req.user.firstName + ' ' + req.user.lastName
    }
  });
}; 