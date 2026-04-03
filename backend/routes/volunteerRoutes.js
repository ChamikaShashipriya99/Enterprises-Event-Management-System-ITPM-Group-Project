const express = require('express');
const router = express.Router();
const { 
    registerVolunteer, 
    getMyVolunteerData, 
    getAllVolunteers,
    assignVolunteer,
    getMyAssignments,
    updateAssignmentStatus,
    markAllAssignmentsRead
} = require('../controllers/volunteerController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', protect, registerVolunteer);
router.get('/me', protect, getMyVolunteerData);
router.get('/all', protect, getAllVolunteers);

router.post('/assign', protect, assignVolunteer);
router.get('/assignments/me', protect, getMyAssignments);
router.put('/assignments/:id/status', protect, updateAssignmentStatus);
router.put('/assignments/read-all', protect, markAllAssignmentsRead);

module.exports = router;
