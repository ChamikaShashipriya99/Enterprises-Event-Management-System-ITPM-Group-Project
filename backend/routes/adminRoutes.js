const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, getUserStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All routes here require admin role
router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/user-stats', getUserStats);

module.exports = router;
