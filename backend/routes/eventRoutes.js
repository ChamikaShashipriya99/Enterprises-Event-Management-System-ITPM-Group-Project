const express = require('express');
const router = express.Router();
const {
    createEvent,
    getOrganizerEvents,
    updateEvent,
    deleteEvent,
    getEvents,
    getEvent,
    registerForEvent,
    unregisterFromEvent
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

// Organizer routes
router.get('/my-events', authorizeRoles('organizer'), getOrganizerEvents);
router.post('/', authorizeRoles('organizer'), createEvent);

// General routes
router.get('/', getEvents);
router.get('/:id', getEvent);
router.put('/:id', authorizeRoles('organizer'), updateEvent);
router.delete('/:id', authorizeRoles('organizer'), deleteEvent);

// Student registration routes
router.post('/:id/register', authorizeRoles('student'), registerForEvent);
router.post('/:id/unregister', authorizeRoles('student'), unregisterFromEvent);

module.exports = router;
