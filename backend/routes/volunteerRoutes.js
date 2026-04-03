const express = require('express');
const router = express.Router();
const { registerVolunteer } = require('../controllers/volunteerController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', protect, registerVolunteer);

module.exports = router;
