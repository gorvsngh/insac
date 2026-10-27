const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const registrationRoutes = require('./routes/registration');
const paymentRoutes = require('./routes/payment');
const abstractRoutes = require('./routes/abstract');
const settingsRoutes = require('./routes/settings');

const app = express();

// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/abstracts', 'uploads/templates', 'uploads/images'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(mongoSanitize());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookie.secret));

// Serve uploaded files (protected by auth where needed)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/registrations', registrationRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/abstracts', abstractRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'INSAC 2026 API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();
  const initDefaults = require('./utils/initDefaults');
  await initDefaults();
  app.listen(config.port, () => {
    console.log(`INSAC 2026 Backend running on port ${config.port} [${config.nodeEnv}]`);
  });
};

startServer();

module.exports = app;
