const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, deleteUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { updateProfileValidation } = require('../middleware/validationMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfileValidation, updateUserProfile);
router.delete('/profile', protect, deleteUserProfile);

router.post('/upload', protect, upload.single('image'), (req, res) => {
    res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
