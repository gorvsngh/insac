const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

// Authenticate user via HttpOnly cookie
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication.' });
  }
};

// Require admin role
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Require participant role
const requireParticipant = (req, res, next) => {
  if (!req.user || req.user.role !== 'participant') {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }
  next();
};

module.exports = { authenticate, requireAdmin, requireParticipant };
