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
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const chatUpload = require('../middleware/chatUploadMiddleware');

const router = express.Router();

router.route('/').post(protect, accessChat).get(protect, fetchChats);
router.route('/global').get(protect, accessGlobalChat);
router.route('/users').get(protect, searchUsers);
router.route('/message').post(protect, sendMessage);
router.route('/message/:chatId').get(protect, allMessages);
router.route('/message/:messageId').put(protect, editMessage).delete(protect, deleteMessage);

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
