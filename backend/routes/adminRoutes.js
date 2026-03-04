const express = require('express');
const { getUsers, deleteUser } = require('../controllers/adminController');
const { getAllEvents, getDashboardStats } = require('../controllers/eventController');
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

module.exports = router;
