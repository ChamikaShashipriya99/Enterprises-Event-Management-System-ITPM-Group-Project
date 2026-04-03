// backend/controllers/vendorController.js
const Vendor = require('../models/Vendor');

// ── Format mongoose validation errors ──────────────────────────────────────────
const formatErrors = (err) => {
    if (err.name === 'ValidationError') {
        return Object.values(err.errors).map((e) => e.message);
    }
    return [err.message];
};

// ── GET /api/vendors ───────────────────────────────────────────────────────────
exports.getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().sort({ createdAt: -1 });
        res.json({ success: true, data: vendors });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── POST /api/vendors ──────────────────────────────────────────────────────────
exports.createVendor = async (req, res) => {
    try {
        const { name, service, contact, email, event, status } = req.body;

        if (!name || !service || !contact || !email || !event) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
                errors: ['Name, service, contact, email and event are required'],
            });
        }

        const vendor = await Vendor.create({ name, service, contact, email, event, status });
        res.status(201).json({ success: true, data: vendor });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message, errors: formatErrors(err) });
    }
};

// ── PUT /api/vendors/:id ───────────────────────────────────────────────────────
exports.updateVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
        res.json({ success: true, data: vendor });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message, errors: formatErrors(err) });
    }
};

// ── DELETE /api/vendors/:id ────────────────────────────────────────────────────
exports.deleteVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndDelete(req.params.id);
        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
        res.json({ success: true, message: 'Vendor removed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
/* ── helpers ── */
const formatErrors = (err) => {
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return { status: 422, message: messages[0], errors: messages };
  }
  if (err.code === 11000) {
    return { status: 409, message: 'A vendor with this email already exists.' };
  }
  return { status: 500, message: err.message || 'Server error' };
};

/* ── GET /api/vendors ── */
exports.getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch vendors' });
  }
};

/* ── POST /api/vendors ── */
exports.createVendor = async (req, res) => {
  try {
    const { name, service, contact, email, event, status } = req.body;

    // Extra server-side guard (on top of mongoose validators)
    if (!name || !service || !contact || !email || !event) {
      return res.status(422).json({ message: 'All fields are required.' });
    }

    const vendor = await Vendor.create({
      name: name.trim(),
      service,
      contact: contact.trim(),
      email: email.trim().toLowerCase(),
      event: event.trim(),
      status: status || 'Pending',
      createdBy: req.user?._id,
    });

    res.status(201).json(vendor);
  } catch (err) {
    const { status, message, errors } = formatErrors(err);
    res.status(status).json({ message, errors });
  }
};

/* ── PUT /api/vendors/:id ── */
exports.updateVendor = async (req, res) => {
  try {
    const { name, service, contact, email, event, status } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { name, service, contact, email, event, status },
      { new: true, runValidators: true }
    );

    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (err) {
    const { status, message, errors } = formatErrors(err);
    res.status(status).json({ message, errors });
  }
};

/* ── DELETE /api/vendors/:id ── */
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json({ message: 'Vendor removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete vendor' });
  }
};
