const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { paymentValidator } = require('../validators');
const validate = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Participant routes
router.post('/', authenticate, paymentValidator, validate, paymentController.submitPayment);
router.get('/my', authenticate, paymentController.getMyPayment);

// Admin routes
router.get('/', authenticate, requireAdmin, paymentController.getAllPayments);
router.get('/all', authenticate, requireAdmin, paymentController.getAllPayments);
router.put('/:id/review', authenticate, requireAdmin, paymentController.reviewPayment);
router.patch('/:id/review', authenticate, requireAdmin, paymentController.reviewPayment);
router.patch('/:id/verify', authenticate, requireAdmin, (req, res, next) => {
  req.body.status = 'verified';
  return paymentController.reviewPayment(req, res, next);
});
router.patch('/:id/reject', authenticate, requireAdmin, (req, res, next) => {
  req.body.status = 'rejected';
  return paymentController.reviewPayment(req, res, next);
});

module.exports = router;
