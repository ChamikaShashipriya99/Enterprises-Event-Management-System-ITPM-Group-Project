// backend/models/Vendor.js
const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true,
      minlength: [2, 'Vendor name must be at least 2 characters'],
      maxlength: [100, 'Vendor name cannot exceed 100 characters'],
    },
    service: {
      type: String,
      required: [true, 'Service type is required'],
      enum: {
        values: ['Equipment', 'Catering', 'Media'],
        message: 'Service type must be Equipment, Catering, or Media',
      },
    },
    contact: {
      type: String,
      required: [true, 'Contact number is required'],
      match: [/^\+?[\d\s\-]{7,15}$/, 'Enter a valid contact number (7–15 digits)'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address'],
    },
    event: {
      type: String,
      required: [true, 'Assigned event is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Pending', 'Completed'],
        message: 'Status must be Active, Pending, or Completed',
      },
      default: 'Pending',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);
