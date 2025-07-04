const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  urgency: { type: String, enum: ['low', 'medium', 'high'], required: true },
  documents: [String],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application; 