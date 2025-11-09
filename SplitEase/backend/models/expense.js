const mongoose = require('mongoose');

const splitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  share: { type: Number, required: true, min: 0 }
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  description: { type: String, required: true, trim: true, maxlength: 200 },
  amount: { type: Number, required: true, min: 0 },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  splits: { type: [splitSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  kind: { type: String, enum: ['expense','payment'], default: 'expense' }
});

module.exports = mongoose.model('Expense', expenseSchema);
