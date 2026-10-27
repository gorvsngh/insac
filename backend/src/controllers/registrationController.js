const Registration = require('../models/Registration');
const EventSettings = require('../models/EventSettings');
const { generateRef } = require('../utils/helpers');
const emailService = require('../services/emailService');

exports.createRegistration = async (req, res, next) => {
  try {
    // Check if user already has a registration
    const existing = await Registration.findOne({ user: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You already have a registration.', registration: existing });
    }

    const { category, institution, department, designation } = req.body;

    // Calculate fee from backend settings - never trust frontend
    const settings = await EventSettings.getSettings();
    const feeAmount = settings.fees[category];
    if (feeAmount === undefined) {
      return res.status(400).json({ success: false, message: 'Invalid registration category.' });
    }

    if (!settings.registrationOpen) {
      return res.status(400).json({ success: false, message: 'Registration is currently closed.' });
    }

    const registrationRef = generateRef('REG');

    const registration = await Registration.create({
      user: req.user._id,
      registrationRef,
      category,
      feeAmount,
      institution: institution || req.user.institution,
      department: department || req.user.department,
      designation: designation || req.user.designation,
    });

    // Update user's participant category
    req.user.participantCategory = category;
    await req.user.save();

    await emailService.sendRegistrationConfirmation(req.user.email, {
      fullName: req.user.fullName,
      registrationRef,
      category: category.replace('_', ' '),
      feeAmount,
    });

    res.status(201).json({ success: true, message: 'Registration submitted successfully.', registration });
  } catch (error) {
    next(error);
  }
};

exports.getMyRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findOne({ user: req.user._id });
    if (!registration) {
      return res.status(404).json({ success: false, message: 'No registration found.' });
    }
    res.json({ success: true, registration });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all registrations
exports.getAllRegistrations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    let query = Registration.find(filter)
      .populate('user', 'fullName email phone institution department designation')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const registrations = await query;
    const total = await Registration.countDocuments(filter);

    // Filter by search term if provided
    let filtered = registrations;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = registrations.filter(r =>
        r.user?.fullName?.toLowerCase().includes(searchLower) ||
        r.user?.email?.toLowerCase().includes(searchLower) ||
        r.registrationRef?.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      registrations: filtered,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Confirm/cancel a registration
exports.updateRegistrationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    registration.status = status;
    if (status === 'confirmed') {
      registration.confirmedBy = req.user._id;
      registration.confirmedAt = new Date();
    }
    await registration.save();

    res.json({ success: true, message: `Registration ${status}.`, registration });
  } catch (error) {
    next(error);
  }
};

// Admin: Export registrations as CSV
exports.exportRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find()
      .populate('user', 'fullName email phone institution department designation')
      .sort({ createdAt: -1 });

    const headers = ['Ref', 'Name', 'Email', 'Phone', 'Category', 'Fee', 'Status', 'Institution', 'Department', 'Date'];
    const rows = registrations.map(r => [
      r.registrationRef,
      r.user?.fullName || '',
      r.user?.email || '',
      r.user?.phone || '',
      r.category,
      r.feeAmount,
      r.status,
      r.institution || '',
      r.department || '',
      r.createdAt?.toISOString().split('T')[0] || '',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=registrations.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
