const express = require('express');
const router = express.Router();
const {
    createEvent,
    getOrganizerEvents,
    updateEvent,
    deleteEvent
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

// Organizer routes
router.post('/', authorizeRoles('organizer'), createEvent);
router.get('/my-events', authorizeRoles('organizer'), getOrganizerEvents);
router.put('/:id', authorizeRoles('organizer'), updateEvent);
router.delete('/:id', authorizeRoles('organizer'), deleteEvent);

module.exports = router;
