const express = require('express');
const router = express.Router();
const regController = require('../controllers/registrationController');
const { registrationValidator } = require('../validators');
const validate = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Participant routes
router.post('/', authenticate, registrationValidator, validate, regController.createRegistration);
router.get('/my', authenticate, regController.getMyRegistration);

// Admin routes
router.get('/', authenticate, requireAdmin, regController.getAllRegistrations);
router.get('/all', authenticate, requireAdmin, regController.getAllRegistrations);
router.put('/:id/status', authenticate, requireAdmin, regController.updateRegistrationStatus);
router.patch('/:id/confirm', authenticate, requireAdmin, (req, res, next) => {
  req.body.status = 'confirmed';
  return regController.updateRegistrationStatus(req, res, next);
});
router.patch('/:id/cancel', authenticate, requireAdmin, (req, res, next) => {
  req.body.status = 'cancelled';
  return regController.updateRegistrationStatus(req, res, next);
});
router.get('/export', authenticate, requireAdmin, regController.exportRegistrations);
router.get('/export/csv', authenticate, requireAdmin, regController.exportRegistrations);

module.exports = router;
