const path = require('path');
const fs = require('fs');
const EventSettings = require('../models/EventSettings');
const User = require('../models/User');
const Registration = require('../models/Registration');
const Payment = require('../models/Payment');
const Abstract = require('../models/Abstract');
const AuditLog = require('../models/AuditLog');

// Public: Get event settings (filtered for public consumption)
exports.getPublicSettings = async (req, res, next) => {
  try {
    const settings = await EventSettings.getSettings();
    // Return only public-safe fields
    const publicSettings = {
      eventTitle: settings.eventTitle,
      eventSubtitle: settings.eventSubtitle,
      conferenceTitle: settings.conferenceTitle,
      conferenceSubtitle: settings.conferenceSubtitle,
      workshopTitle: settings.workshopTitle,
      eventStartDate: settings.eventStartDate,
      eventEndDate: settings.eventEndDate,
      datesConfirmed: settings.datesConfirmed,
      datesNote: settings.datesNote,
      venue: settings.venue,
      venueAddress: settings.venueAddress,
      aboutEvent: settings.aboutEvent,
      aboutINS: settings.aboutINS,
      aboutLNMU: settings.aboutLNMU,
      aboutWIT: settings.aboutWIT,
      fees: settings.fees,
      paymentMethods: settings.paymentMethods,
      paymentInstructions: settings.paymentInstructions,
      abstractWordLimit: settings.abstractWordLimit,
      abstractDeadline: settings.abstractDeadline,
      abstractInstructions: settings.abstractInstructions,
      registrationDeadline: settings.registrationDeadline,
      registrationOpen: settings.registrationOpen,
      abstractSubmissionOpen: settings.abstractSubmissionOpen,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      contactWhatsApp: settings.contactWhatsApp,
      logoUrl: settings.logoUrl,
      bannerUrl: settings.bannerUrl,
      insLogoUrl: settings.insLogoUrl,
      lnmuLogoUrl: settings.lnmuLogoUrl,
      witLogoUrl: settings.witLogoUrl,
      importantDates: settings.importantDates,
      announcements: (settings.announcements || []).filter(a => a.isActive),
      eligibility: settings.eligibility,
      accommodation: settings.accommodation,
      travelInfo: settings.travelInfo,
      committees: settings.committees,
      themes: (settings.themes || []).filter(t => t.isPublished),
      hasAbstractTemplate: !!settings.abstractTemplateFile,
    };
    res.json({ success: true, settings: publicSettings });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all settings
exports.getAdminSettings = async (req, res, next) => {
  try {
    const settings = await EventSettings.getSettings();
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

// Admin: Update settings
exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await EventSettings.getSettings();

    // Whitelist of updatable fields
    const updatable = [
      'eventTitle', 'eventSubtitle', 'conferenceTitle', 'conferenceSubtitle', 'workshopTitle',
      'eventStartDate', 'eventEndDate', 'datesConfirmed', 'datesNote',
      'venue', 'venueAddress',
      'aboutEvent', 'aboutINS', 'aboutLNMU', 'aboutWIT',
      'fees', 'paymentMethods', 'paymentInstructions',
      'abstractWordLimit', 'abstractDeadline', 'abstractInstructions',
      'registrationDeadline', 'registrationOpen', 'abstractSubmissionOpen',
      'contactEmail', 'contactPhone', 'contactWhatsApp',
      'importantDates', 'announcements', 'eligibility', 'accommodation', 'travelInfo',
      'committees', 'themes',
    ];

    updatable.forEach(field => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();

    await AuditLog.create({
      action: 'settings_updated',
      performedBy: req.user._id,
      targetType: 'settings',
      targetId: settings._id,
      details: `Settings updated: ${Object.keys(req.body).filter(k => updatable.includes(k)).join(', ')}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Settings updated.', settings });
  } catch (error) {
    next(error);
  }
};

// Admin: Upload abstract template
exports.uploadTemplate = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const settings = await EventSettings.getSettings();

    // Store old template info for versioning
    if (settings.abstractTemplateFile) {
      const oldPath = settings.abstractTemplateFile;
      const backupPath = oldPath.replace(/(\.[^.]+)$/, `_backup_${Date.now()}$1`);
      if (fs.existsSync(path.resolve(settings.abstractTemplateFile))) {
        fs.copyFileSync(path.resolve(settings.abstractTemplateFile), path.resolve(backupPath));
      }
    }

    settings.abstractTemplateFile = req.file.path;
    settings.abstractTemplateName = req.file.originalname;
    await settings.save();

    await AuditLog.create({
      action: 'template_uploaded',
      performedBy: req.user._id,
      targetType: 'template',
      details: `Abstract template replaced: ${req.file.originalname}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Template uploaded successfully.', filename: req.file.originalname });
  } catch (error) {
    next(error);
  }
};

// Public: Download abstract template
exports.downloadTemplate = async (req, res, next) => {
  try {
    const settings = await EventSettings.getSettings();
    if (!settings.abstractTemplateFile) {
      return res.status(404).json({ success: false, message: 'No abstract template available.' });
    }

    let filePath = path.resolve(settings.abstractTemplateFile);
    if (!fs.existsSync(filePath)) {
      filePath = path.resolve(__dirname, '..', '..', settings.abstractTemplateFile);
    }
    if (!fs.existsSync(filePath)) {
      filePath = path.resolve(__dirname, '..', settings.abstractTemplateFile);
    }
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Template file not found on disk.' });
    }

    res.download(filePath, settings.abstractTemplateName || 'Template for extended abstract (INSAC-2026).docx');
  } catch (error) {
    next(error);
  }
};

// Admin: Dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalRegistrations,
      pendingRegistrations,
      confirmedRegistrations,
      studentRegistrations,
      scholarRegistrations,
      facultyRegistrations,
      pendingPayments,
      verifiedPayments,
      submittedAbstracts,
      pendingAbstracts,
      acceptedAbstracts,
      rejectedAbstracts,
    ] = await Promise.all([
      User.countDocuments({ role: 'participant' }),
      Registration.countDocuments(),
      Registration.countDocuments({ status: 'pending' }),
      Registration.countDocuments({ status: 'confirmed' }),
      Registration.countDocuments({ category: 'student' }),
      Registration.countDocuments({ category: 'research_scholar' }),
      Registration.countDocuments({ category: 'faculty' }),
      Payment.countDocuments({ status: { $in: ['submitted', 'under_verification'] } }),
      Payment.countDocuments({ status: 'verified' }),
      Abstract.countDocuments(),
      Abstract.countDocuments({ status: { $in: ['submitted', 'under_review'] } }),
      Abstract.countDocuments({ status: 'accepted' }),
      Abstract.countDocuments({ status: 'rejected' }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalRegistrations,
        pendingRegistrations,
        confirmedRegistrations,
        studentRegistrations,
        scholarRegistrations,
        facultyRegistrations,
        registrationsByCategory: {
          student: studentRegistrations,
          research_scholar: scholarRegistrations,
          faculty: facultyRegistrations,
        },
        pendingPayments,
        verifiedPayments,
        submittedAbstracts,
        pendingAbstracts,
        acceptedAbstracts,
        rejectedAbstracts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { role: 'participant' };

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get audit logs
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const logs = await AuditLog.find()
      .populate('performedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await AuditLog.countDocuments();

    res.json({
      success: true,
      logs,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Upload logo/banner
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const { imageType } = req.body; // logoUrl, bannerUrl, insLogoUrl, lnmuLogoUrl, witLogoUrl
    const validTypes = ['logoUrl', 'bannerUrl', 'insLogoUrl', 'lnmuLogoUrl', 'witLogoUrl'];
    if (!validTypes.includes(imageType)) {
      return res.status(400).json({ success: false, message: 'Invalid image type.' });
    }

    const settings = await EventSettings.getSettings();
    settings[imageType] = `/uploads/${req.file.filename}`;
    await settings.save();

    res.json({ success: true, message: 'Image uploaded.', path: settings[imageType] });
  } catch (error) {
    next(error);
  }
};
