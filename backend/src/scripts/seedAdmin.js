require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config');

async function seedAdmin() {
  if (!config.admin.email || !config.admin.password) {
    console.error('ERROR: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  try {
    const connectDB = require('../config/db');
    await connectDB();

    const User = require('../models/User');

    const existing = await User.findOne({ email: config.admin.email.toLowerCase() });
    if (existing) {
      console.log(`Admin user already exists: ${config.admin.email}`);
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log('Role updated to admin.');
      }
    } else {
      await User.create({
        fullName: config.admin.name,
        email: config.admin.email.toLowerCase(),
        password: config.admin.password,
        role: 'admin',
        isEmailVerified: true,
        consentGiven: true,
      });
      console.log(`Admin user created: ${config.admin.email}`);
    }

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
