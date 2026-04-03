const express = require('express');
const router = express.Router();
const { registerVolunteer, getMyVolunteerData } = require('../controllers/volunteerController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', protect, registerVolunteer);
router.get('/me', protect, getMyVolunteerData);

module.exports = router;
