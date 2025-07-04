const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const patientController = require('../controllers/patientController');
const { upload } = require('../utils/fileUpload'); // Adjust the path if needed

router.get('/dashboard', protect, restrictTo('patient'), patientController.dashboard);
router.get('/applications', protect, restrictTo('patient'), patientController.getApplications);
router.post(
    '/applications',
    protect,
    restrictTo('patient'),
    upload.array('documents', 5), // <-- This enables file upload!
    patientController.createApplication
  );
router.get('/applications/:id', protect, restrictTo('patient'), patientController.getApplicationById);
router.patch('/applications/:id', protect, restrictTo('patient'), patientController.updateApplication);
router.get('/donations', protect, restrictTo('patient'), patientController.getDonations);

module.exports = router; 