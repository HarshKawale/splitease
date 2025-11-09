const router = require('express').Router();
const auth = require('../middleware/auth');
const Expense = require('../models/expense');
const Group = require('../models/group');

// POST /api/expenses - add expense
router.post('/', auth, async (req, res) => {
  try {
    const { groupId, description, amount, paidBy, splits } = req.body || {};
    if (!groupId || !description || !amount || !paidBy || !Array.isArray(splits)) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    // validate user in group
    const group = await Group.findById(groupId).select('_id members').lean();
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const inGroup = group.members.map(id => String(id));
    if (!inGroup.includes(String(req.user.uid))) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (!inGroup.includes(String(paidBy))) {
      return res.status(400).json({ message: 'Payer must be a member of the group' });
    }

    // validate splits sum <= amount (allow minor float differences)
    const sumSplits = splits.reduce((acc, s) => acc + Number(s.share || 0), 0);
    if (Math.abs(sumSplits - Number(amount)) > 0.01) {
      return res.status(400).json({ message: 'Splits must sum to total amount' });
    }

    const expense = await Expense.create({
      groupId,
      description: String(description).trim(),
      amount: Number(amount),
      paidBy,
      splits: splits.map(s => ({ userId: s.userId, share: Number(s.share) }))
    });

    return res.status(201).json(expense);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/expenses/:groupId - list expenses
router.get('/:groupId', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const expenses = await Expense.find({ groupId }).sort({ createdAt: -1 }).lean();
    return res.json({ expenses });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
