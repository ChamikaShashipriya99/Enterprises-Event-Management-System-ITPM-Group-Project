// ─────────────────────────────────────────────────────────────────────────────
// MERGE INSTRUCTIONS
// Add the following imports and routes to your existing backend/routes/adminRoutes.js
// Do NOT replace the existing file — only append the booking-related routes.
// ─────────────────────────────────────────────────────────────────────────────

// 1. Add these imports at the top of adminRoutes.js (after existing imports):
//
//    const { getAllBookings, getBookingStats } = require('../controllers/bookingController');
//
// 2. Add these routes before `module.exports = router;`:
//
//    router.get('/bookings', getAllBookings);
//    router.get('/bookings/stats', getBookingStats);
//
// ─────────────────────────────────────────────────────────────────────────────
// FULL UPDATED adminRoutes.js (for reference):
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const { getUsers, deleteUser } = require('../controllers/adminController');
const { getAllEvents, getDashboardStats } = require('../controllers/eventController');
const { getAllBookings, getBookingStats } = require('../controllers/bookingController'); // NEW
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Admin routes
router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/events', getAllEvents);
router.get('/stats', getDashboardStats);

// Booking admin routes (NEW)
router.get('/bookings', getAllBookings);
router.get('/bookings/stats', getBookingStats);

module.exports = router;
