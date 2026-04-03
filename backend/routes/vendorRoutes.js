// backend/routes/vendorRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} = require('../controllers/vendorController');

router.use(protect);
router.use(authorizeRoles('admin'));

router.route('/')
  .get(getVendors)
  .post(createVendor);

router.route('/:id')
  .put(updateVendor)
  .delete(deleteVendor);

module.exports = router;
