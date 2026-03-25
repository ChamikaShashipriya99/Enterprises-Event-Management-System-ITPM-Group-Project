const express = require('express');
const {
    accessChat,
    fetchChats,
    sendMessage,
    allMessages,
    searchUsers,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, accessChat).get(protect, fetchChats);
router.route('/users').get(protect, searchUsers);
router.route('/message').post(protect, sendMessage);
router.route('/message/:chatId').get(protect, allMessages);

module.exports = router;
