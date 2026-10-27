const path = require('path');
const fs = require('fs');
const Abstract = require('../models/Abstract');
const EventSettings = require('../models/EventSettings');
const AuditLog = require('../models/AuditLog');
const { generateRef, countWords } = require('../utils/helpers');
const emailService = require('../services/emailService');

exports.submitAbstract = async (req, res, next) => {
  try {
    const settings = await EventSettings.getSettings();
    if (!settings.abstractSubmissionOpen) {
      return res.status(400).json({ success: false, message: 'Abstract submission is currently closed.' });
    }

    const { title, abstractText, authorName, coAuthors, institution, department, researchTheme, keywords, contactEmail } = req.body;

    // Server-side word count enforcement
    const wordCount = countWords(abstractText);
    if (wordCount > settings.abstractWordLimit) {
      return res.status(400).json({
        success: false,
        message: `Abstract exceeds word limit. Maximum: ${settings.abstractWordLimit} words. Your abstract: ${wordCount} words.`,
      });
    }

    const abstractRef = generateRef('ABS');
    const abstractData = {
      user: req.user._id,
      abstractRef,
      title,
      abstractText,
      wordCount,
      authorName,
      coAuthors,
      institution,
      department,
      researchTheme,
      keywords,
      contactEmail,
      status: 'submitted',
    };

    // Handle file attachment
    if (req.file) {
      abstractData.attachmentPath = req.file.path;
      abstractData.attachmentOriginalName = req.file.originalname;
    }

    const abstract = await Abstract.create(abstractData);

    res.status(201).json({ success: true, message: 'Abstract submitted successfully.', abstract });
  } catch (error) {
    next(error);
  }
};

exports.getMyAbstracts = async (req, res, next) => {
  try {
    const abstracts = await Abstract.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, abstracts, abstract: abstracts[0] || null });
  } catch (error) {
    next(error);
  }
};

exports.getAbstractById = async (req, res, next) => {
  try {
    const abstract = await Abstract.findOne({ _id: req.params.id, user: req.user._id });
    if (!abstract) {
      return res.status(404).json({ success: false, message: 'Abstract not found.' });
    }
    res.json({ success: true, abstract });
  } catch (error) {
    next(error);
  }
};

// Update abstract (only if status allows it)
exports.updateAbstract = async (req, res, next) => {
  try {
    const abstract = await Abstract.findOne({ _id: req.params.id, user: req.user._id });
    if (!abstract) {
      return res.status(404).json({ success: false, message: 'Abstract not found.' });
    }

    if (!['draft', 'submitted', 'revision_requested'].includes(abstract.status)) {
      return res.status(400).json({ success: false, message: 'Abstract cannot be edited in its current status.' });
    }

    const settings = await EventSettings.getSettings();
    const allowedFields = ['title', 'abstractText', 'authorName', 'coAuthors', 'institution', 'department', 'researchTheme', 'keywords', 'contactEmail'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) abstract[field] = req.body[field];
    });

    if (req.body.abstractText) {
      abstract.wordCount = countWords(req.body.abstractText);
      if (abstract.wordCount > settings.abstractWordLimit) {
        return res.status(400).json({
          success: false,
          message: `Abstract exceeds word limit. Maximum: ${settings.abstractWordLimit} words.`,
        });
      }
    }

    if (abstract.status === 'revision_requested') {
      abstract.status = 'submitted';
    }

    if (req.file) {
      abstract.attachmentPath = req.file.path;
      abstract.attachmentOriginalName = req.file.originalname;
    }

    await abstract.save();
    res.json({ success: true, message: 'Abstract updated.', abstract });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all abstracts
exports.getAllAbstracts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, theme, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (theme) filter.researchTheme = theme;

    const abstracts = await Abstract.find(filter)
      .select('+reviewNotes')
      .populate('user', 'fullName email institution')
      .populate('reviewedBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Abstract.countDocuments(filter);

    let filtered = abstracts;
    if (search) {
      const s = search.toLowerCase();
      filtered = abstracts.filter(a =>
        a.title?.toLowerCase().includes(s) ||
        a.authorName?.toLowerCase().includes(s) ||
        a.abstractRef?.toLowerCase().includes(s) ||
        a.user?.fullName?.toLowerCase().includes(s)
      );
    }

    res.json({
      success: true,
      abstracts: filtered,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Review abstract
exports.reviewAbstract = async (req, res, next) => {
  try {
    const { status, reviewNotes, revisionComments } = req.body;
    const validStatuses = ['under_review', 'accepted', 'rejected', 'revision_requested'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const abstract = await Abstract.findById(req.params.id).select('+reviewNotes').populate('user', 'fullName email');
    if (!abstract) {
      return res.status(404).json({ success: false, message: 'Abstract not found.' });
    }

    abstract.status = status;
    abstract.reviewedBy = req.user._id;
    abstract.reviewedAt = new Date();
    if (reviewNotes !== undefined) abstract.reviewNotes = reviewNotes;
    if (revisionComments !== undefined) abstract.revisionComments = revisionComments;
    await abstract.save();

    await AuditLog.create({
      action: `abstract_${status}`,
      performedBy: req.user._id,
      targetType: 'abstract',
      targetId: abstract._id,
      details: `Abstract ${abstract.abstractRef} ${status}`,
      ipAddress: req.ip,
    });

    if (abstract.user) {
      await emailService.sendAbstractStatusUpdate(abstract.contactEmail || abstract.user.email, {
        authorName: abstract.authorName,
        title: abstract.title,
        abstractRef: abstract.abstractRef,
        status,
        comments: revisionComments,
      });
    }

    res.json({ success: true, message: `Abstract ${status}.`, abstract });
  } catch (error) {
    next(error);
  }
};

// Download abstract attachment (authorized only)
exports.downloadAttachment = async (req, res, next) => {
  try {
    const abstract = await Abstract.findById(req.params.id);
    if (!abstract) {
      return res.status(404).json({ success: false, message: 'Abstract not found.' });
    }

    // Only owner or admin can download
    const isOwner = abstract.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (!abstract.attachmentPath) {
      return res.status(404).json({ success: false, message: 'No attachment found.' });
    }

    const filePath = path.resolve(abstract.attachmentPath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Attachment file not found.' });
    }

    res.download(filePath, abstract.attachmentOriginalName || 'attachment');
  } catch (error) {
    next(error);
  }
};
