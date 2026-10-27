const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
  constructor() {
    this.isConfigured = !!(config.smtp.host && config.smtp.user && config.smtp.pass);
    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass,
        },
      });
    }
  }

  async send(to, subject, html) {
    if (!this.isConfigured) {
      console.log(`[Email Service] Not configured. Would have sent to ${to}: ${subject}`);
      return { sent: false, reason: 'Email service not configured' };
    }
    try {
      await this.transporter.sendMail({
        from: config.smtp.from,
        to,
        subject,
        html,
      });
      return { sent: true };
    } catch (error) {
      console.error('[Email Service] Error:', error.message);
      return { sent: false, reason: error.message };
    }
  }

  async sendVerificationEmail(email, token) {
    const url = `${config.frontendUrl}/verify-email?token=${token}`;
    return this.send(email, 'Verify Your Email - INSAC 2026', `
      <h2>Email Verification</h2>
      <p>Please click the link below to verify your email address:</p>
      <a href="${url}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `);
  }

  async sendPasswordResetEmail(email, token) {
    const url = `${config.frontendUrl}/reset-password?token=${token}`;
    return this.send(email, 'Password Reset - INSAC 2026', `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${url}">Reset Password</a>
      <p>This link expires in 1 hour. If you did not request this, please ignore this email.</p>
    `);
  }

  async sendRegistrationConfirmation(email, data) {
    return this.send(email, 'Registration Confirmation - INSAC 2026', `
      <h2>Registration Received</h2>
      <p>Dear ${data.fullName},</p>
      <p>Your registration has been received successfully.</p>
      <p><strong>Registration Reference:</strong> ${data.registrationRef}</p>
      <p><strong>Category:</strong> ${data.category}</p>
      <p><strong>Fee:</strong> ₹${data.feeAmount}</p>
      <p>Please log in to your dashboard for further details.</p>
    `);
  }

  async sendAbstractStatusUpdate(email, data) {
    return this.send(email, `Abstract ${data.status} - INSAC 2026`, `
      <h2>Abstract Status Update</h2>
      <p>Dear ${data.authorName},</p>
      <p>Your abstract "<strong>${data.title}</strong>" (Ref: ${data.abstractRef}) has been ${data.status}.</p>
      ${data.comments ? `<p><strong>Comments:</strong> ${data.comments}</p>` : ''}
      <p>Please log in to your dashboard for further details.</p>
    `);
  }

  async sendPaymentStatusUpdate(email, data) {
    return this.send(email, `Payment ${data.status} - INSAC 2026`, `
      <h2>Payment Status Update</h2>
      <p>Dear ${data.fullName},</p>
      <p>Your payment for registration ${data.registrationRef} has been ${data.status}.</p>
      ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
      <p>Please log in to your dashboard for further details.</p>
    `);
  }
}

module.exports = new EmailService();
