/**
 * Attendance Routes
 * Routes for QR check-in, attendance management, and attendance tracking
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const attendanceController = require('../controllers/attendanceController');

/**
 * POST /api/attendance/check-in
 * Scan QR code and mark student attendance
 * Access: Admin, Organizer
 */
router.post('/check-in', protect, authorizeRoles('admin', 'organizer'), attendanceController.checkInStudent);

/**
 * GET /api/attendance/event/:eventId
 * Get attendance records for a specific event
 * Access: Admin, Organizer (for own events)
 */
router.get('/event/:eventId', protect, authorizeRoles('admin', 'organizer'), attendanceController.getEventAttendance);

/**
 * GET /api/attendance/booking/:bookingId
 * Get attendance record for a specific booking
 * Access: Admin, Organizer, Student (own booking)
 */
router.get('/booking/:bookingId', protect, attendanceController.getBookingAttendance);

/**
 * PUT /api/attendance/:attendanceId/status
 * Update attendance status (for manual adjustments)
 * Access: Admin, Organizer
 */
router.put(
    '/:attendanceId/status',
    protect,
    authorizeRoles('admin', 'organizer'),
    attendanceController.updateAttendanceStatus
);

/**
 * GET /api/attendance/student/history
 * Get attendance history for logged-in student
 * Access: Student
 */
router.get('/student/history', protect, authorizeRoles('student'), attendanceController.getStudentAttendanceHistory);

module.exports = router;