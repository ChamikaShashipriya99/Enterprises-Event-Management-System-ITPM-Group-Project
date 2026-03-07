const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
    {
        certificateId: {
            type: String,
            unique: true,
            required: true,
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
        filePath: {
            type: String,
            required: true,
        },
        issuedAt: {
            type: Date,
            default: Date.now,
        },
        emailSent: {
            type: Boolean,
            default: false,
        },
        emailSentAt: {
            type: Date,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Certificate', certificateSchema);