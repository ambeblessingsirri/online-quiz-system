const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const logger = require('../utils/logger');

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Prevent self-registration as admin
    const safeRole = role === 'admin' ? 'student' : role || 'student';

    const user = await User.create({ name, email, password, role: safeRole });

    const token = signToken(user._id, user.role);

    logger.info(`New user registered: ${email} (${safeRole})`);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    logger.error(`Register error: ${err.message}`);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Your account has been deactivated.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id, user.role);

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

const getMe = async (req, res) => {
  res.status(200).json({ user: req.user.toSafeObject() });
};

module.exports = { register, login, getMe };
