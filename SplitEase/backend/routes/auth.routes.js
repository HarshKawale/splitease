// routes/auth.routes.js
const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Helper: basic validators
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidPassword = (p) => typeof p === 'string' && p.length >= 6;

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, walletBalance, isActive, address, preferences } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      walletBalance: walletBalance || 0,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      address: address || {},
      preferences: preferences || {}
    });

    await user.save();

    return res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body || {};
    email = (email || '').trim().toLowerCase();
    password = password || '';

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { uid: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Auth middleware (local to this file for simplicity)
function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Current user
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.uid).select('_id name email walletBalance');
  if (!user) return res.status(404).json({ message: 'User does not exist' });
  return res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      walletBalance: user.walletBalance
    }
  });
});


module.exports = router;
