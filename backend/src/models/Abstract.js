const mongoose = require('mongoose');

const abstractSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  abstractRef: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: [true, 'Abstract title is required'],
    trim: true,
    maxlength: 500,
  },
  abstractText: {
    type: String,
    required: [true, 'Abstract text is required'],
    trim: true,
  },
  wordCount: {
    type: Number,
    required: true,
  },
  authorName: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
  },
  coAuthors: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  institution: {
    type: String,
    required: [true, 'Institution is required'],
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  researchTheme: {
    type: String,
    required: [true, 'Research theme is required'],
    trim: true,
  },
  keywords: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    trim: true,
    lowercase: true,
  },
  attachmentPath: {
    type: String,
  },
  attachmentOriginalName: {
    type: String,
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'revision_requested'],
    default: 'submitted',
  },
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: 2000,
    select: false, // Internal notes not sent to participants
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: Date,
  revisionComments: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
}, {
  timestamps: true,
});

abstractSchema.index({ user: 1 });
abstractSchema.index({ status: 1 });
abstractSchema.index({ researchTheme: 1 });

module.exports = mongoose.model('Abstract', abstractSchema);
