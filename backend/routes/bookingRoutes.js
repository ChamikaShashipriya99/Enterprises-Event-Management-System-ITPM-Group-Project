const express = require('express');
const router = express.Router();

const {
    createBooking,
    cancelBooking
} = require('../controllers/bookingController');

const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');


//All routes require authentication
router.use(protect);

// Student Routes

// Check available seats for an event (any authenticated user)
router.get('/availability/:eventId', checkAvailability);

// Create a new booking
router.post('/', authorizeRoles('student'), validateCreateBooking, createBooking);

// Cancel a booking
router.put('/:bookingId/cancel', authorizeRoles('student'), validateCancelBooking, cancelBooking);

module.exports = router;