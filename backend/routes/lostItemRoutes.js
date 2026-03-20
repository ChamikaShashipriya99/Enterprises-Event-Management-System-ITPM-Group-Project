const router = require('express').Router();
const { reportItem, getAllItems, resolveItem } = require('../controllers/lostItemController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, reportItem)
    .get(protect, getAllItems);

router.route('/:id/resolve')
    .put(protect, resolveItem);

module.exports = router;
