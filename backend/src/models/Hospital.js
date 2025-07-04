const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  phone: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  specialization: [{
    type: String
  }],
  bedCapacity: {
    type: Number,
    required: true
  },
  availableBeds: {
    type: Number,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  documents: [{
    type: {
      type: String,
      enum: ['license', 'certification', 'other']
    },
    url: String,
    uploadedAt: Date
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: [{
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const Hospital = mongoose.model('Hospital', hospitalSchema);
module.exports = Hospital; 