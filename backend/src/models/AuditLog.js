const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetType: {
    type: String,
    enum: ['user', 'registration', 'payment', 'abstract', 'settings', 'template'],
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  details: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  ipAddress: {
    type: String,
  },
}, {
  timestamps: true,
});

auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
