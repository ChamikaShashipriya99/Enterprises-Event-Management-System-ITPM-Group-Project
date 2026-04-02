const express = require('express');
const router = express.Router();
const {
    checkAvailability,
    createBooking,
    cancelBooking,
    getMyBookings,
    getBookingById,
    checkIn,
    generateCertificate,
    downloadCertificate,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
    validateCreateBooking,
    validateCancelBooking,
    validateCheckIn,
    validateGenerateCertificate,
} = require('../middleware/bookingValidation');

// ─── All routes require authentication ────────────────────────────────────────
router.use(protect);

// ─── Student Routes ────────────────────────────────────────────────────────────

// Check available seats for an event (any authenticated user)
router.get('/availability/:eventId', checkAvailability);

// Get logged-in student's own bookings
// IMPORTANT: must be before /:bookingId to avoid wildcard conflict
router.get('/my-bookings', authorizeRoles('student'), getMyBookings);

// ─── Certificate Routes ────────────────────────────────────────────────────────
// IMPORTANT: /certificate/download/:certificateId must be registered BEFORE
// /:bookingId — otherwise Express matches "certificate" as a bookingId param.

// Download a certificate PDF
router.get(
    '/certificate/download/:certificateId',
    downloadCertificate
);

// ─── Organizer / Admin Routes ─────────────────────────────────────────────────
// IMPORTANT: /checkin must be before /:bookingId for the same reason.

// QR code check-in (records attendance)
router.post(
    '/checkin',
    authorizeRoles('organizer', 'admin'),
    validateCheckIn,
    checkIn
);

// ─── Wildcard param routes — must come LAST ───────────────────────────────────

// Get a single booking by bookingId (student sees own; admin sees all)
router.get('/:bookingId', getBookingById);

// Create a new booking
router.post('/', authorizeRoles('student'), validateCreateBooking, createBooking);

// Cancel a booking
router.put('/:bookingId/cancel', authorizeRoles('student'), validateCancelBooking, cancelBooking);

// Generate a certificate for an attended booking
router.post(
    '/:bookingId/certificate',
    authorizeRoles('student'),
    validateGenerateCertificate,
    generateCertificate
);

module.exports = router;
