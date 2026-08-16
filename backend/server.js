require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const groupRoutes = require('./routes/group.routes');
const expenseRoutes = require('./routes/expense.routes');
const summaryRoutes = require('./routes/summary.routes');
const walletRoutes = require('./routes/wallet.routes');
const userRoutes = require('./routes/user.routes');

const Group = require('./models/group');
const Expense = require('./models/expense');
const User = require('./models/User');


const app = express();

// Allow requests from configured origin (defaults to localhost for dev)
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:4000';
app.use(cors({
  origin: [allowedOrigin, 'http://localhost:5000', 'http://127.0.0.1:5000', 'http://127.0.0.1:4000'],
  credentials: true
}));

// Parse incoming JSON
app.use(express.json());

// Serve static frontend files from ../v1 (relative to backend)
app.use(express.static(path.join(__dirname, '..', 'v1')));

// Health check endpoint
app.get('/api/health', (req, res) => res.json({ ok: true }));

// API routes 
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/users', userRoutes);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 API running on http://localhost:${PORT}`);
      console.log(`🌐 App: http://localhost:${PORT}/home.html`);
    });
  })
  .catch(err => {
    console.error('DB error', err);
    process.exit(1);
  });
