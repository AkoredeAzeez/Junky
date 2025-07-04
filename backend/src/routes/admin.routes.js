const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

// Public route
router.post('/login', adminController.login);

// Protected routes (admin only)
router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

router.get('/dashboard', adminController.dashboard);
router.get('/users', adminController.getAllUsers);
router.get('/applications', adminController.getAllApplications);
router.patch('/applications/:id', adminController.updateApplication);
router.get('/donors', adminController.getAllDonors);
router.get('/patients', adminController.getAllPatients);
router.get('/hospitals', adminController.getAllHospitals);

router.post('/', restrictTo('super_admin'), adminController.createAdmin);
router.get('/', adminController.getAllAdmins);
router.patch('/:id', adminController.updateAdmin);
router.delete('/:id', restrictTo('super_admin'), adminController.deleteAdmin);

module.exports = router; 