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
                message: 'Service must be Equipment, Catering, or Media',
            },
        },
        contact: {
            type: String,
            required: [true, 'Contact number is required'],
            match: [/^\+?[\d\s\-]{7,15}$/, 'Please enter a valid contact number'],
        },
        email: {
            type: String,
            required: [true, 'Email address is required'],
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
        },
        event: {
            type: String,
            required: [true, 'Assigned event is required'],
        },
        status: {
            type: String,
            enum: ['Active', 'Pending', 'Completed'],
            default: 'Pending',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);
