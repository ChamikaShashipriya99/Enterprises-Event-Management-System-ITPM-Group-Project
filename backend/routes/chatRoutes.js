const express = require('express');
const {
    accessChat,
    fetchChats,
    sendMessage,
    allMessages,
    searchUsers,
    accessGlobalChat,
    editMessage,
    deleteMessage,
    toggleReaction,
    togglePinMessage,
    clearChatMessages,
    getAuditLogs,
    getChatStats,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const chatUpload = require('../middleware/chatUploadMiddleware');

const router = express.Router();

router.route('/').post(protect, accessChat);
router.route('/').get(protect, fetchChats);
router.route('/global').get(protect, accessGlobalChat);
router.route('/users').get(protect, searchUsers);
router.route('/message').post(protect, sendMessage);
router.route('/message/:chatId').get(protect, allMessages);
router.route('/message/:messageId').put(protect, editMessage);
router.route('/message/:messageId').delete(protect, deleteMessage);
router.route('/message/:messageId/react').post(protect, toggleReaction);
router.route('/:chatId/pin/:messageId').post(protect, togglePinMessage);
router.route('/:chatId/clear').delete(protect, clearChatMessages);
router.get('/stats', protect, getChatStats);
router.route('/audit-logs').get(protect, getAuditLogs);

router.post('/upload', protect, chatUpload.single('file'), (req, res) => {
    if (req.file) {
        const fileUrl = `/uploads/chat/${req.file.filename}`;
        res.status(200).json({ 
            fileUrl,
            fileType: req.file.mimetype.startsWith('image') ? 'image' : 
                      req.file.mimetype.startsWith('audio') ? 'audio' : 'file'
        });
    } else {
        res.status(400).json({ message: 'File upload failed' });
    }
});

module.exports = router;
