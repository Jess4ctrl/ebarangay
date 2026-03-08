const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { User } = require('../models/index');

exports.register = async (req, res) => {
  try {
    const { full_name, email, password, address, phone, birthdate } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      full_name,
      email,
      password: hashed,
      address,
      phone,
      birthdate,
      role: 'user',
    });

    res.status(201).json({
      message: 'Account created successfully',
      userId: user.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check role
    if (user.role !== role) {
      return res.status(403).json({ message: 'Role mismatch. Please select the correct role.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id:    user.id,
        name:  user.full_name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};