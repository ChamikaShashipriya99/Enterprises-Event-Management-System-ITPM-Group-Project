const mongoose = require('mongoose');

/**
 * Attendance Model - Tracks student check-in records for events
 * Uses embedded attendance tracking for audit and verification purposes
 */
const attendanceSchema = new mongoose.Schema(
    {
        // Reference to the booking
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: [true, 'Booking reference is required'],
            unique: true, // One attendance record per booking
        },

        // Student reference for quick queries
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student reference is required'],
            index: true,
        },

        // Event reference
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: [true, 'Event reference is required'],
            index: true,
        },

        // Attendance status
        status: {
            type: String,
            enum: ['present', 'absent', 'excused'],
            default: 'present',
        },

        // Check-in details
        checkedInAt: {
            type: Date,
            required: [true, 'Check-in timestamp is required'],
        },

        // Who performed the check-in (Admin or Organizer)
        checkedInBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Check-in operator must be recorded'],
        },

        // QR data that was scanned
        qrCodeScanned: {
            type: String,
            required: true,
        },

        // Additional notes about check-in
        notes: {
            type: String,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
    },
    {
        timestamps: true, // createdAt and updatedAt
    }
);

// Compound index to ensure one check-in per booking
attendanceSchema.index({ booking: 1, student: 1, event: 1 }, { unique: true });

// Index for quick lookup of attendance by event
attendanceSchema.index({ event: 1, status: 1 });

// Index for student attendance history
attendanceSchema.index({ student: 1, 'event.date': -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
