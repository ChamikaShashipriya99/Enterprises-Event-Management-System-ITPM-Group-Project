const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema(
    {
        bookingId: {
            type: String,
            unique: true,
            default: () => `BK-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`,
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: [true, 'Event is required'],
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student is required'],
        },
        status: {
            type: String,
            enum: ['confirmed', 'cancelled', 'attended'],
            default: 'confirmed',
        },
        qrCode: {
            type: String, // Base64 QR code image string
            required: false,
        },
        qrCodeData: {
            type: String, // Raw data encoded in QR
            required: false,
        },
        checkedIn: {
            type: Boolean,
            default: false,
        },
        checkedInAt: {
            type: Date,
            required: false,
        },
        cancelledAt: {
            type: Date,
            required: false,
        },
        cancellationReason: {
            type: String,
            required: false,
            maxlength: [500, 'Cancellation reason cannot exceed 500 characters'],
        },
        certificateGenerated: {
            type: Boolean,
            default: false,
        },
        certificatePath: {
            type: String,
            required: false,
        },
        reminderSent: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to prevent duplicate bookings (same student + same event)
bookingSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);