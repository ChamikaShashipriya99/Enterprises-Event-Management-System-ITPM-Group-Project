const LostItem = require('../models/LostItem');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Report a new lost or found item
// @route   POST /api/lost-found
// @access  Private
const reportItem = async (req, res) => {
    try {
        const { type, itemName, category, description, location, date, image } = req.body;

        if (!type || !itemName || !category || !description || !location || !date) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const newItem = await LostItem.create({
            type,
            itemName,
            category,
            description,
            location,
            date,
            image,
            reporter: req.user._id,
            status: 'Active'
        });

        // ============================================
        // SMART MATCH LOGIC
        // ============================================
        const oppositeType = type === 'Lost' ? 'Found' : 'Lost';
        
        // Find potential matches that are active, opposite type, and matching category
        const potentialMatches = await LostItem.find({
            type: oppositeType,
            category: category,
            status: 'Active',
            reporter: { $ne: req.user._id } // Don't match with items reported by the exact same user
        });

        if (potentialMatches.length > 0) {
            // Notify the user who just created the report
            await Notification.create({
                user: req.user._id,
                message: `Smart Match Alert 🧩: We found ${potentialMatches.length} recent '${oppositeType}' report(s) matching the '${category}' category for your ${itemName}. Check the feed!`,
                isRead: false,
                link: '/lost-and-found'
            });

            // Notify the users who reported the potential matching items
            for (const match of potentialMatches) {
                await Notification.create({
                    user: match.reporter,
                    message: `Smart Match Alert 🧩: A new '${type}' report for '${itemName}' was just added. It might match your '${match.itemName}'!`,
                    isRead: false,
                    link: '/lost-and-found'
                });
            }
        }

        // ============================================
        // ADMIN NOTIFICATION LOGIC
        // ============================================
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            await Notification.create({
                user: admin._id,
                message: `Moderation Alert: A new '${type}' report for a '${itemName}' was just submitted by a user.`,
                isRead: false,
                link: '/admin/lost-found'
            });
        }

        // ============================================
        // ADMIN BROADCAST LOGIC (If Admin Reports)
        // ============================================
        if (req.user.role === 'admin') {
            const students = await User.find({ role: 'student' });
            for (const student of students) {
                await Notification.create({
                    user: student._id,
                    message: `Official Hub Alert 📢: An Administrator has reported a '${type}' item (${itemName}). Please check the Recovery Hub!`,
                    isRead: false,
                    link: '/lost-and-found'
                });
            }
        }

        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error reporting item:', error);
        res.status(500).json({ message: 'Server error while reporting item' });
    }
};

// @desc    Get all lost and found items
// @route   GET /api/lost-found
// @access  Private
const getAllItems = async (req, res) => {
    try {
        // Optional filters
        const { type, status } = req.query;
        let query = {};
        
        if (type) query.type = type;
        if (status) query.status = status;

        const items = await LostItem.find(query)
            .sort({ createdAt: -1 })
            .populate('reporter', 'name email profilePicture'); // Get reporter details

        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Server error while fetching items' });
    }
};

// @desc    Mark item as resolved
// @route   PUT /api/lost-found/:id/resolve
// @access  Private
const resolveItem = async (req, res) => {
    try {
        const item = await LostItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Authorization: Only the original reporter or an admin can resolve the item
        if (item.reporter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to resolve this item' });
        }

        item.status = 'Resolved';
        await item.save();

        res.status(200).json(item);
    } catch (error) {
        console.error('Error resolving item:', error);
        res.status(500).json({ message: 'Server error while resolving item' });
    }
};

module.exports = {
    reportItem,
    getAllItems,
    resolveItem
};
