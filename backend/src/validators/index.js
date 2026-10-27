const { body } = require('express-validator');

const registerValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 200 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword').optional().custom((value, { req }) => {
    if (value && value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
  body('phone').optional().trim().isLength({ max: 20 }),
  body('institution').optional().trim().isLength({ max: 300 }),
  body('department').optional().trim().isLength({ max: 200 }),
  body('designation').optional().trim().isLength({ max: 200 }),
  body('consentGiven').isBoolean().custom(v => {
    if (v !== true && v !== 'true') throw new Error('You must agree to the terms');
    return true;
  }),
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
];

const registrationValidator = [
  body('category').isIn(['student', 'research_scholar', 'faculty']).withMessage('Invalid category'),
  body('institution').optional().trim().isLength({ max: 300 }),
  body('department').optional().trim().isLength({ max: 200 }),
  body('designation').optional().trim().isLength({ max: 200 }),
];

const paymentValidator = [
  body('transactionId').trim().notEmpty().withMessage('UPI UTR / Transaction ID is required').isLength({ min: 6, max: 100 }).withMessage('Please enter a valid UPI UTR / Transaction ID'),
  body('payerUpiId').trim().notEmpty().withMessage('Payer UPI ID is required (e.g. name@okhdfcbank)').isLength({ min: 3, max: 100 }),
  body('amountPaid').optional().isFloat({ min: 0 }).withMessage('Valid amount is required'),
  body('paymentDate').optional().isISO8601().withMessage('Valid payment date is required'),
  body('paymentMethod').optional().isIn(['upi', 'cash', 'bank_transfer']),
  body('remarks').optional().trim().isLength({ max: 500 }),
];

const abstractValidator = [
  body('title').trim().notEmpty().withMessage('Abstract title is required').isLength({ max: 500 }),
  body('abstractText').trim().notEmpty().withMessage('Abstract text is required'),
  body('authorName').trim().notEmpty().withMessage('Author name is required'),
  body('coAuthors').optional().trim().isLength({ max: 1000 }),
  body('institution').trim().notEmpty().withMessage('Institution is required'),
  body('department').optional().trim(),
  body('researchTheme').trim().notEmpty().withMessage('Research theme is required'),
  body('keywords').optional().trim().isLength({ max: 500 }),
  body('contactEmail').trim().isEmail().withMessage('Valid contact email is required').normalizeEmail(),
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  registrationValidator,
  paymentValidator,
  abstractValidator,
};
