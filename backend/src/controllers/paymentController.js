const Payment = require('../models/Payment');
const Registration = require('../models/Registration');
const AuditLog = require('../models/AuditLog');
const EventSettings = require('../models/EventSettings');
const emailService = require('../services/emailService');

exports.submitPayment = async (req, res, next) => {
  try {
    // Find user's registration
    const registration = await Registration.findOne({ user: req.user._id });
    if (!registration) {
      return res.status(400).json({ success: false, message: 'You must register before submitting payment details.' });
    }

    // Check for existing payment
    const existing = await Payment.findOne({ user: req.user._id, registration: registration._id });
    if (existing && existing.status !== 'rejected') {
      return res.status(409).json({ success: false, message: 'Payment details already submitted.', payment: existing });
    }

    const paymentMethod = req.body.paymentMethod || 'upi';
    const amountPaid = Number(req.body.amountPaid) || registration.feeAmount;
    const paymentDate = req.body.paymentDate || new Date();

    const payment = await Payment.create({
      user: req.user._id,
      registration: registration._id,
      registrationRef: registration.registrationRef,
      paymentMethod,
      amountPaid,
      paymentDate,
      transactionId: req.body.transactionId,
      payerUpiId: req.body.payerUpiId,
      receiptNumber: req.body.receiptNumber,
      transferReference: req.body.transferReference,
      transferDate: req.body.transferDate,
      remarks: req.body.remarks,
      status: 'submitted',
    });

    res.status(201).json({ success: true, message: 'Payment details submitted successfully.', payment });
  } catch (error) {
    next(error);
  }
};

exports.getMyPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, payment: payment || null });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all payments
exports.getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .populate('user', 'fullName email phone')
      .populate('registration', 'registrationRef category feeAmount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      payments,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Verify or reject payment
exports.reviewPayment = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['under_verification', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const payment = await Payment.findById(req.params.id).populate('user', 'fullName email');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    payment.status = status;
    payment.reviewedBy = req.user._id;
    payment.reviewedAt = new Date();
    if (status === 'rejected') payment.rejectionReason = rejectionReason || '';
    await payment.save();

    // If verified, confirm registration
    if (status === 'verified' && payment.registration) {
      const Registration = require('../models/Registration');
      await Registration.findByIdAndUpdate(payment.registration, {
        status: 'confirmed',
        confirmedBy: req.user._id,
        confirmedAt: new Date(),
      });
    }

    // Log admin action
    await AuditLog.create({
      action: `payment_${status}`,
      performedBy: req.user._id,
      targetType: 'payment',
      targetId: payment._id,
      details: `Payment ${payment.registrationRef} ${status}${rejectionReason ? ': ' + rejectionReason : ''}`,
      ipAddress: req.ip,
    });

    // Send email notification
    if (payment.user) {
      await emailService.sendPaymentStatusUpdate(payment.user.email, {
        fullName: payment.user.fullName,
        registrationRef: payment.registrationRef,
        status,
        reason: rejectionReason,
      });
    }

    res.json({ success: true, message: `Payment ${status}.`, payment });
  } catch (error) {
    next(error);
  }
};
