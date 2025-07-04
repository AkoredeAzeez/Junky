const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
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
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  type: {
    type: String,
    enum: ['individual', 'organization', 'corporate'],
    required: true
  },
  organizationName: {
    type: String,
    required: function() {
      return this.type !== 'individual';
    }
  },
  taxId: {
    type: String,
    required: function() {
      return this.type !== 'individual';
    }
  },
  donations: [{
    amount: {
      type: Number,
      required: true
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign'
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      required: true
    },
    transactionId: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  totalDonated: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      }
    },
    anonymousDonations: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

const Donor = mongoose.model('Donor', donorSchema);
module.exports = Donor; 