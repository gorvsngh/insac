require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/insac2026',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cookie: {
    secret: process.env.COOKIE_SECRET || 'dev-cookie-secret',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME || 'Admin',
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'noreply@insac2026.org',
  },
  upload: {
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '10'),
    dir: process.env.UPLOAD_DIR || 'uploads',
  },
};
