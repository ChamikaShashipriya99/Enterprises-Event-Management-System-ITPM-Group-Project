/**
 * Attendance Controller
 * Handles QR code check-in operations, attendance verification, and attendance records
 */

const Booking = require('../models/Booking');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const User = require('../models/User');
const { validateAndParseQRCode, verifyQRMatchesBooking } = require('../utils/qrCodeGenerator');

/**
 * Scan QR code and mark attendance
 * POST /api/attendance/check-in
 *
 * @param {Object} req - Express request
 * @param {string} req.body.qrCode - Raw QR code data from scanner
 * @param {Object} req.user - Authenticated user (organizer/admin performing check-in)
 * @returns {Object} - Success response with attendance record
 */
exports.checkInStudent = async (req, res) => {
    try {
        const { qrCode } = req.body;

        // Validate QR code is provided
        if (!qrCode || qrCode.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'QR code data is required',
            });
        }

        // Verify user has permission to check in (admin or organizer)
        if (!['admin', 'organizer'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Only admins and organizers can perform check-ins',
            });
        }

        // Parse and validate QR code
        let qrData;
        try {
            qrData = validateAndParseQRCode(qrCode);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: `Invalid QR code: ${error.message}`,
            });
        }

        // Find booking in database
        const booking = await Booking.findOne({ bookingId: qrData.bookingId })
            .populate('student', 'name email')
            .populate('event', 'title date organizer');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found for this QR code',
            });
        }

        // Verify QR data matches booking
        if (!verifyQRMatchesBooking(qrData, booking)) {
            return res.status(400).json({
                success: false,
                message: 'QR code does not match this booking',
            });
        }

        // Check booking status
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cannot check in: This booking has been cancelled',
            });
        }

        // Check if already checked in
        if (booking.checkedIn) {
            return res.status(400).json({
                success: false,
                message: 'Student has already been checked in for this event',
                checkedInAt: booking.checkedInAt,
                checkedInBy: booking.checkedInBy,
            });
        }

        // Verify event date is valid for check-in (event should be today or past)
        const eventDate = new Date(booking.event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);

        if (eventDate > today) {
            return res.status(400).json({
                success: false,
                message: 'Check-in is not allowed before event date',
            });
        }

        // Verify organizer owns this event (if not admin)
        if (req.user.role === 'organizer' && req.user._id.toString() !== booking.event.organizer.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only check in students for events you organize',
            });
        }

        // Update booking with check-in info
        booking.checkedIn = true;
        booking.checkedInAt = new Date();
        booking.checkedInBy = req.user._id;
        booking.status = 'attended';

        await booking.save();

        // Create attendance record
        const attendance = new Attendance({
            booking: booking._id,
            student: booking.student._id,
            event: booking.event._id,
            status: 'present',
            checkedInAt: booking.checkedInAt,
            checkedInBy: req.user._id,
            qrCodeScanned: qrCode,
            notes: `Checked in by ${req.user.role}`,
        });

        await attendance.save();

        // Populate necessary fields for response
        await attendance.populate('booking student event checkedInBy');

        res.status(200).json({
            success: true,
            message: 'Student checked in successfully',
            data: {
                attendance: {
                    attendanceId: attendance._id,
                    bookingId: booking.bookingId,
                    studentName: booking.student.name,
                    studentEmail: booking.student.email,
                    eventTitle: booking.event.title,
                    checkedInAt: attendance.checkedInAt,
                    checkedInBy: req.user.name,
                    status: attendance.status,
                },
            },
        });
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during check-in process',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Get list of attendance records for an event
 * GET /api/attendance/event/:eventId
 * Admin and Organizers only
 *
 * @param {Object} req - Express request
 * @param {string} req.params.eventId - Event ID
 * @returns {Object[]} - Array of attendance records
 */
exports.getEventAttendance = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Find event and verify permissions
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }

        // Verify user has permission
        if (req.user.role === 'organizer' && req.user._id.toString() !== event.organizer.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only view attendance for events you organize',
            });
        }

        // Get all attendance records for event
        const attendanceRecords = await Attendance.find({ event: eventId })
            .populate('student', 'name email')
            .populate('checkedInBy', 'name role')
            .sort('-checkedInAt');

        const summary = {
            totalAttendees: attendanceRecords.length,
            present: attendanceRecords.filter((a) => a.status === 'present').length,
            absent: attendanceRecords.filter((a) => a.status === 'absent').length,
            excused: attendanceRecords.filter((a) => a.status === 'excused').length,
        };

        res.status(200).json({
            success: true,
            summary,
            data: attendanceRecords,
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving attendance records',
        });
    }
};

/**
 * Get attendance record for a specific booking
 * GET /api/attendance/booking/:bookingId
 *
 * @param {Object} req - Express request
 * @param {string} req.params.bookingId - Booking ID
 * @returns {Object} - Attendance record
 */
exports.getBookingAttendance = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const attendance = await Attendance.findOne({ booking: bookingId })
            .populate('booking')
            .populate('student', 'name email')
            .populate('event', 'title date')
            .populate('checkedInBy', 'name role');

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'No attendance record found for this booking',
            });
        }

        res.status(200).json({
            success: true,
            data: attendance,
        });
    } catch (error) {
        console.error('Get booking attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving attendance record',
        });
    }
};

/**
 * Update attendance status (for manual adjustments)
 * PUT /api/attendance/:attendanceId/status
 * Admin and Organizers only
 *
 * @param {Object} req - Express request
 * @param {string} req.params.attendanceId - Attendance record ID
 * @param {string} req.body.status - New status (present, absent, excused)
 * @returns {Object} - Updated attendance record
 */
exports.updateAttendanceStatus = async (req, res) => {
    try {
        const { attendanceId } = req.params;
        const { status, notes } = req.body;

        // Validate status
        if (!['present', 'absent', 'excused'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid attendance status',
            });
        }

        // Verify permissions
        if (!['admin', 'organizer'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Only admins and organizers can update attendance',
            });
        }

        // Find and update attendance record
        const attendance = await Attendance.findByIdAndUpdate(
            attendanceId,
            {
                status,
                notes: notes || attendance?.notes,
            },
            { new: true, runValidators: true }
        )
            .populate('student', 'name email')
            .populate('event', 'title')
            .populate('checkedInBy', 'name role');

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Attendance status updated successfully',
            data: attendance,
        });
    } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating attendance status',
        });
    }
};

/**
 * Get attendance history for logged-in student
 * GET /api/attendance/student/history
 * Students can only view their own attendance
 *
 * @param {Object} req - Express request
 * @returns {Object[]} - Array of attendance records for student
 */
exports.getStudentAttendanceHistory = async (req, res) => {
    try {
        // Get all attendance records for logged-in student
        const attendanceHistory = await Attendance.find({ student: req.user._id })
            .populate('event', 'title date location')
            .populate('booking', 'bookingId')
            .sort('-checkedInAt');

        res.status(200).json({
            success: true,
            totalEvents: attendanceHistory.length,
            data: attendanceHistory,
        });
    } catch (error) {
        console.error('Get student attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving your attendance history',
        });
    }
};

module.exports = exports;
