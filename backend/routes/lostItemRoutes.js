const router = require('express').Router();
const { reportItem, getAllItems, resolveItem, updateItem, getItemById } = require('../controllers/lostItemController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, reportItem)
    .get(protect, getAllItems);

router.route('/:id')
    .get(protect, getItemById)
    .put(protect, updateItem);

router.route('/:id/resolve')
    .put(protect, resolveItem);

module.exports = router;
