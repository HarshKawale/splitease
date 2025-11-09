const mongoose = require('mongoose');
const router = require('express').Router();
const auth = require('../middleware/auth');
const Group = require('../models/group');
const User = require('../models/User');
const Expense = require('../models/expense');

// GET /api/groups - list groups for current user
router.get('/', auth, async (req, res) => {
    try {
        const groups = await Group.find({
            members: { $in: [req.user.uid] }
        }).sort({ createdAt: -1 }).lean();

        if (!groups.length) {
            return res.json([]);
        }

        const groupIds = groups.map(g => g._id);
        const currentUserId = String(req.user.uid);
        
        const lastExpenses = await Expense.aggregate([
            { $match: { groupId: { $in: groupIds } } },
            { $sort: { createdAt: -1 } },
            { $group: { _id: '$groupId', lastActivity: { $first: '$createdAt' } } }
        ]);
        const lastMap = new Map(lastExpenses.map(x => [String(x._id), x.lastActivity]));

        const allExpenses = await Expense.find({ groupId: { $in: groupIds } }).lean();
        
        const expensesByGroup = {};
        allExpenses.forEach(exp => {
            const gid = String(exp.groupId);
            if (!expensesByGroup[gid]) expensesByGroup[gid] = [];
            expensesByGroup[gid].push(exp);
        });

        for (const g of groups) {
            const groupId = String(g._id);
            g.id = groupId;
            g.memberCount = g.members.length;
            g.lastActivity = lastMap.get(groupId) || g.createdAt;

            const expenses = expensesByGroup[groupId] || [];
            
            let totalPaid = 0;
            let totalOwed = 0;
            
            expenses.forEach(expense => {
                if (String(expense.paidBy) === currentUserId) {
                    totalPaid += expense.amount;
                }
                
                if (expense.splits) {
                    const userSplit = expense.splits.find(s => String(s.userId) === currentUserId);
                    if (userSplit) {
                        totalOwed += userSplit.share;
                    }
                }
            });
            
            const netBalance = totalPaid - totalOwed;
            g.youAreOwed = netBalance > 0 ? netBalance : 0;
            g.youOwe = netBalance < 0 ? Math.abs(netBalance) : 0;
        }

        return res.json(groups);
    } catch (err) {
        console.error('GET /groups error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});




// POST /api/groups - create group by emails
router.post('/', auth, async (req, res) => {
  try {
    const { name, type = 'other', members = [] } = req.body || {};
    const cleanName = (name || '').trim();
    if (!cleanName || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    // map emails -> userIds
    const emails = members.map(e => String(e || '').trim().toLowerCase()).filter(Boolean);
    const users = await User.find({ email: { $in: emails } }).select('_id email').lean();

    if (users.length !== emails.length) {
      return res.status(400).json({ message: 'Some members not found' });
    }

    const memberIds = users.map(u => u._id);
    // Ensure creator is included
    if (!memberIds.find(id => String(id) === String(req.user.uid))) {
      memberIds.push(req.user.uid);
    }

    const group = await Group.create({
      name: cleanName,
      type,
      members: memberIds,
      createdBy: req.user.uid
    });

    return res.status(201).json({
      id: group._id,
      name: group.name,
      type: group.type,
      memberCount: group.members.length,
      createdAt: group.createdAt
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/groups/:id - get single group with balance calculations
router.get('/:id', auth, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('members', 'name email')
            .lean();
        
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        
        // Check if user is a member
        const isMember = group.members.some(m => String(m._id) === String(req.user.uid));
        if (!isMember) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        
        // Get expenses for this group
        const expenses = await Expense.find({ groupId: group._id })
            .populate('paidBy', 'name email')
            .sort({ createdAt: -1 })
            .lean();
        
        group.expenses = expenses;
        group.totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
        group.pendingExpensesCount = expenses.length;
        
        // Calculate balance: how much each person paid vs how much they owe
        const balances = {}; // { userId: netBalance }
        
        // Initialize all members to 0
        group.members.forEach(m => {
            balances[String(m._id)] = 0;
        });
        
        // For each expense
        expenses.forEach(expense => {
            const paidById = String(expense.paidBy._id || expense.paidBy);
            
            // Person who paid gets credited
            balances[paidById] = (balances[paidById] || 0) + expense.amount;
            
            // Each person in splits owes their share
            if (expense.splits && Array.isArray(expense.splits)) {
                expense.splits.forEach(split => {
                    const userId = String(split.userId);
                    balances[userId] = (balances[userId] || 0) - split.share;
                });
            }
        });
        
        // Calculate how much current user is owed overall
        const currentUserId = String(req.user.uid);
        group.youAreOwed = balances[currentUserId] || 0;
        
        // Generate balance summary (who owes whom)
        group.balanceSummary = [];
        const members = group.members;
        
        for (let i = 0; i < members.length; i++) {
            for (let j = i + 1; j < members.length; j++) {
                const user1 = members[i];
                const user2 = members[j];
                const balance1 = balances[String(user1._id)] || 0;
                const balance2 = balances[String(user2._id)] || 0;
                
                if (balance1 > 0 && balance2 < 0) {
                    const amount = Math.min(balance1, Math.abs(balance2));
                    group.balanceSummary.push({
                        text: `${user2.name} owes ${user1.name}`,
                        amount: amount
                    });
                } else if (balance2 > 0 && balance1 < 0) {
                    const amount = Math.min(balance2, Math.abs(balance1));
                    group.balanceSummary.push({
                        text: `${user1.name} owes ${user2.name}`,
                        amount: amount
                    });
                }
            }
        }
        
        return res.json(group);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});


// DELETE /api/groups/:id - delete group
router.delete('/:id', auth, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        
        // Check if user is a member or creator
        const isMember = group.members.some(m => String(m) === String(req.user.uid));
        if (!isMember) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        
        // Delete all expenses related to this group
        await Expense.deleteMany({ groupId: group._id });
        
        // Delete the group
        await Group.findByIdAndDelete(req.params.id);
        
        return res.json({ message: 'Group deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
