const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const abstractController = require('../controllers/abstractController');
const { abstractValidator } = require('../validators');
const validate = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { sanitizeFilename } = require('../utils/helpers');
const config = require('../config');

// Multer setup for abstract attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(config.upload.dir, 'abstracts'));
  },
  filename: (req, file, cb) => {
    const safeName = sanitizeFilename(file.originalname);
    cb(null, `${Date.now()}_${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSizeMB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed.'));
    }
  },
});

// Participant routes
router.post('/', authenticate, upload.single('attachment'), abstractValidator, validate, abstractController.submitAbstract);
router.get('/my', authenticate, abstractController.getMyAbstracts);
router.get('/my/:id', authenticate, abstractController.getAbstractById);
router.put('/:id', authenticate, upload.single('attachment'), abstractController.updateAbstract);
router.get('/:id/download', authenticate, abstractController.downloadAttachment);

// Admin routes
router.get('/', authenticate, requireAdmin, abstractController.getAllAbstracts);
router.get('/all', authenticate, requireAdmin, abstractController.getAllAbstracts);
router.put('/:id/review', authenticate, requireAdmin, abstractController.reviewAbstract);
router.patch('/:id/review', authenticate, requireAdmin, abstractController.reviewAbstract);

module.exports = router;
