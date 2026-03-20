const express = require('express');
const router = express.Router();
const { getUserNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getUserNotifications);

router.route('/:id/read')
    .put(markAsRead);

module.exports = router;
