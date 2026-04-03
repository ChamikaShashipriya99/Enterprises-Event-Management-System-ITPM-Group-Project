// backend/routes/vendorRoutes.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
    getAllVendors,
    createVendor,
    updateVendor,
    deleteVendor,
} = require('../controllers/vendorController');

router.use(protect, authorizeRoles('admin'));

router.route('/')
    .get(getAllVendors)
    .post(createVendor);

router.route('/:id')
    .put(updateVendor)
    .delete(deleteVendor);

module.exports = router;
