const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  registrationRef: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    enum: ['student', 'research_scholar', 'faculty'],
    required: [true, 'Registration category is required'],
  },
  feeAmount: {
    type: Number,
    required: true,
  },
  feeCurrency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  institution: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  designation: {
    type: String,
    trim: true,
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  confirmedAt: Date,
}, {
  timestamps: true,
});

registrationSchema.index({ status: 1 });
registrationSchema.index({ category: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
