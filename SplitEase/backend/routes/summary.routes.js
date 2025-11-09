const router = require('express').Router();
const auth = require('../middleware/auth');
const Expense = require('../models/expense');
const Group = require('../models/group');

// GET /api/summary - totals for dashboard
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.uid }).select('_id').lean();
    const groupIds = groups.map(g => g._id);

    if (groupIds.length === 0) {
      return res.json({ youAreOwed: 0, youOwe: 0, totalGroups: 0 });
    }

    const expenses = await Expense.find({ groupId: { $in: groupIds } }).lean();

    let net = 0;
    for (const e of expenses) {
      if (String(e.paidBy) === String(req.user.uid)) net += e.amount;
      for (const s of e.splits) {
        if (String(s.userId) === String(req.user.uid)) net -= s.share;
      }
    }

    const youAreOwed = net > 0 ? net : 0;
    const youOwe = net < 0 ? Math.abs(net) : 0;

    return res.json({ youAreOwed, youOwe, totalGroups: groupIds.length });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
