const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  type: { type: String, enum: ['trip','home','couple','other'], default: 'other' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', groupSchema);
