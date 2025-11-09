const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  zipCode: String
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  age: { type: Number, min: 0 },
  walletBalance: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true }, // boolean type
  address: addressSchema, // nested object
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
