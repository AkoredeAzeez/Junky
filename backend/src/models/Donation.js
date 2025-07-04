const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String },
  status: { type: String, enum: ['pending', 'completed'], default: 'completed' },
  createdAt: { type: Date, default: Date.now }
});

const Donation = mongoose.model('Donation', donationSchema);
module.exports = Donation; 