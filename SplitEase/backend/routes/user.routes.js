const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// PATCH /api/users/profile - update logged-in user profile
router.patch('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { firstName, lastName, email, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();

    return res.json({ message: 'Profile updated successfully' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});


// DELETE /api/users - delete logged-in user account along with their groups and expenses
router.delete('/', auth, async (req, res) => {
  try {
    const userId = req.user.uid;

    // Delete all groups created by user
    // (Or you may want to handle user leaving groups differently)
    await Group.deleteMany({ createdBy: userId });
    await Expense.deleteMany({ paidBy: userId });

    // Delete the user account
    await User.findByIdAndDelete(userId);

    return res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Account delete error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
