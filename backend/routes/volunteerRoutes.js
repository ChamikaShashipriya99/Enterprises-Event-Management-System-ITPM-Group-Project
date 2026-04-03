const express = require('express');
const router = express.Router();
const { registerVolunteer, getMyVolunteerData, getAllVolunteers } = require('../controllers/volunteerController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', protect, registerVolunteer);
router.get('/me', protect, getMyVolunteerData);
router.get('/all', protect, getAllVolunteers);

module.exports = router;
