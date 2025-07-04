const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const hospitalController = require('../controllers/hospitalController');

// Public routes
router.post('/register', hospitalController.register);
// If you want a dedicated login endpoint for hospitals, uncomment below:
// router.post('/login', hospitalController.login);
router.get('/', hospitalController.listHospitals);
router.get('/:id', hospitalController.getHospital);

// Protected routes
router.use(protect);

// Hospital-specific routes
router.patch('/:id/profile', restrictTo('hospital'), hospitalController.updateProfile);
router.post('/:id/documents', restrictTo('hospital'), hospitalController.uploadDocuments);

// Patient routes
router.post('/:id/reviews', restrictTo('patient'), hospitalController.addReview);

router.get('/dashboard', protect, restrictTo('hospital'), hospitalController.dashboard);
router.get('/applications', protect, restrictTo('hospital'), hospitalController.getApplications);
router.patch('/applications/:id', protect, restrictTo('hospital'), hospitalController.updateApplication);
router.post('/documents', protect, restrictTo('hospital'), hospitalController.uploadDocuments);

module.exports = router; 