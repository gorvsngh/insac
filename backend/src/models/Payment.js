const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  registration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
  },
  registrationRef: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'cash', 'bank_transfer'],
    default: 'upi',
  },
  amountPaid: {
    type: Number,
    required: [true, 'Amount paid is required'],
    min: 0,
  },
  paymentDate: {
    type: Date,
    required: [true, 'Payment date is required'],
    default: Date.now,
  },
  // UPI fields
  transactionId: {
    type: String,
    required: [true, 'UPI UTR / Transaction ID is required'],
    trim: true,
  },
  payerUpiId: {
    type: String,
    required: [true, 'Payer UPI ID is required'],
    trim: true,
  },
  // Cash fields
  receiptNumber: {
    type: String,
    trim: true,
  },
  // Bank transfer fields
  transferReference: {
    type: String,
    trim: true,
  },
  transferDate: {
    type: Date,
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['not_submitted', 'submitted', 'under_verification', 'verified', 'rejected'],
    default: 'submitted',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: Date,
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: 500,
  },
}, {
  timestamps: true,
});

paymentSchema.index({ user: 1 });
paymentSchema.index({ registration: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
