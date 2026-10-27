const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { sanitizeFilename } = require('../utils/helpers');
const config = require('../config');

// Multer for template and image uploads
const templateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(config.upload.dir, 'templates'));
  },
  filename: (req, file, cb) => {
    const safeName = sanitizeFilename(file.originalname);
    cb(null, `${Date.now()}_${safeName}`);
  },
});

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(config.upload.dir, 'images'));
  },
  filename: (req, file, cb) => {
    const safeName = sanitizeFilename(file.originalname);
    cb(null, `${Date.now()}_${safeName}`);
  },
});

const uploadTemplate = multer({
  storage: templateStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.odt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Invalid template file format.'));
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Invalid image format.'));
  },
});

// Public routes
router.get('/public', settingsController.getPublicSettings);
router.get('/template/download', settingsController.downloadTemplate);

// Admin routes
router.get('/', authenticate, requireAdmin, settingsController.getAdminSettings);
router.put('/', authenticate, requireAdmin, settingsController.updateSettings);
router.post('/template', authenticate, requireAdmin, uploadTemplate.single('template'), settingsController.uploadTemplate);
router.post('/image', authenticate, requireAdmin, uploadImage.single('image'), settingsController.uploadImage);
router.get('/dashboard', authenticate, requireAdmin, settingsController.getDashboardStats);
router.get('/admin/stats', authenticate, requireAdmin, settingsController.getDashboardStats);
router.get('/users', authenticate, requireAdmin, settingsController.getAllUsers);
router.get('/audit-logs', authenticate, requireAdmin, settingsController.getAuditLogs);

module.exports = router;
