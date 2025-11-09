const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Group = require('../models/group');
const Expense = require('../models/expense');

// Add money to wallet
router.post('/add', auth, async (req, res) => {
  try {
    const amt = Number(req.body.amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }
    const user = await User.findByIdAndUpdate(
      req.user.uid,
      { $inc: { walletBalance: amt } },
      { new: true }
    ).select('walletBalance');
    return res.status(200).json({ walletBalance: user.walletBalance });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Pay from wallet to settle within a group (payer -> payee)
router.post('/pay', auth, async (req, res) => {
  try {
    const { groupId, payeeId, amount, note } = req.body || {};
    const amt = Number(amount);
    if (!groupId || !payeeId || !Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ message: 'Invalid request' });
    }
    if (String(payeeId) === String(req.user.uid)) {
      return res.status(400).json({ message: 'Cannot pay yourself' });
    }

    // Ensure both are members of the group
    const group = await Group.findById(groupId).select('members').lean();
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const members = group.members.map(String);
    if (!members.includes(String(req.user.uid)) || !members.includes(String(payeeId))) {
      return res.status(400).json({ message: 'Both users must be group members' });
    }

    // Check wallet balance
    const payer = await User.findById(req.user.uid).select('walletBalance');
    if (!payer || payer.walletBalance < amt) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Deduct from payer wallet
    await User.updateOne({ _id: req.user.uid }, { $inc: { walletBalance: -amt } });

    // Record a payment entry in expenses to affect balances
    // Requires Expense.kind field added: enum ['expense','payment'] with default 'expense'
    const payment = await Expense.create({
      groupId,
      description: note ? `Wallet Payment: ${note}` : 'Wallet Payment',
      amount: amt,
      paidBy: req.user.uid,
      kind: 'payment',
      splits: [{ userId: payeeId, share: amt }]
    });

    // Optionally, credit payee wallet (toggle depending on design)
    // await User.updateOne({ _id: payeeId }, { $inc: { walletBalance: amt } });

    return res.status(201).json({ paymentId: payment._id });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
