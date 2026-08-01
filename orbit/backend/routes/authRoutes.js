const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: true, message: errors.array()[0].msg });
  next();
};

router.post('/signup', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 chars')
], handleValidation, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: true, message: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    // Public signup always creates a Member; Admins are promoted from the admin panel.
    const user = await User.create({ name, email, passwordHash, role: 'Member' });

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) { next(err); }
});

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], handleValidation, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: true, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: true, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
});

router.get('/users', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] });
    res.json(users);
  } catch (err) { next(err); }
});

router.put('/admin/users/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: true, message: 'User not found' });

    user.name = name;
    user.email = email;
    user.role = role;
    await user.save();

    res.json({ message: 'User updated successfully' });
  } catch (err) { next(err); }
});

router.put('/admin/users/:id/password', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: true, message: 'User not found' });

    user.passwordHash = await bcrypt.hash(req.body.password, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) { next(err); }
});

const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { ResetToken } = require('../models');

// Configure NodeMailer transporter (Safe default fallback if no .env config)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  connectionTimeout: 2000, // Give up after 2 seconds instead of hanging
  auth: {
    user: process.env.EMAIL_USER || 'fake@email.com',
    pass: process.env.EMAIL_PASS || 'fakepassword'
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Return success even if not found to prevent email enumeration
      return res.json({ message: 'If that email exists, a reset link was sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60000); // 15 mins

    await ResetToken.create({ userId: user.id, token, expiresAt });

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    // Dev Mode Bypass: Commented out the slow email sending
    try {
      /*
      await transporter.sendMail({
        from: '"Orbit System" <noreply@orbit.com>',
        to: user.email,
        subject: 'Password Reset Request',
        html: `<h3>Orbit Mission Control</h3>
               <p>You requested a password reset. Click the link below to securely change your password.</p>
               <a href="${resetLink}">${resetLink}</a>
               <p>This link will expire in 15 minutes.</p>`
      });
      */
      console.log('✅ Dev Mode Bypass: Email sending skipped.');
      console.log('👉 Reset link generated:', resetLink);
    } catch (mailErr) {
      console.error('Email failed to send. Printing link instead:', resetLink);
    }

    res.json({ message: 'If that email exists, a reset link was sent.' });
  } catch (err) { next(err); }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: true, message: 'Missing token or password' });

    const resetRecord = await ResetToken.findOne({ where: { token } });
    if (!resetRecord) return res.status(400).json({ error: true, message: 'Invalid or expired token' });

    if (new Date() > resetRecord.expiresAt) {
      await resetRecord.destroy();
      return res.status(400).json({ error: true, message: 'Invalid or expired token' });
    }

    const user = await User.findByPk(resetRecord.userId);
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    await resetRecord.destroy(); // Burn token

    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (err) { next(err); }
});

module.exports = router;
