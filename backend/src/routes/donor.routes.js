const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const donorController = require('../controllers/donorController');

router.get('/dashboard', protect, restrictTo('donor'), donorController.dashboard);
router.get('/cases', protect, restrictTo('donor'), donorController.getCases);
router.post('/donate', protect, restrictTo('donor'), donorController.makeDonation);
router.get('/donations', protect, restrictTo('donor'), donorController.getDonations);

module.exports = router; 