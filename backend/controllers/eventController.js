const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Organizer
exports.createEvent = async (req, res, next) => {
    try {
        req.body.organizer = req.user.id;
        const event = await Event.create(req.body);
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all events for organizer
// @route   GET /api/events/my-events
// @access  Private/Organizer
exports.getOrganizerEvents = async (req, res, next) => {
    try {
        const events = await Event.find({ organizer: req.user.id });
        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (error) {
        next(error);
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Organizer
exports.updateEvent = async (req, res, next) => {
    try {
        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        // Ensure user is event organizer
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this event' });
        }

        event = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Organizer
exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this event' });
        }

        await event.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all events (Admin)
// @route   GET /api/admin/events
// @access  Private/Admin
exports.getAllEvents = async (req, res, next) => {
    try {
        const events = await Event.find().populate('organizer', 'name email');
        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Dashboard Statistics (Admin)
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalEvents = await Event.countDocuments();
        const totalOrganizers = await User.countDocuments({ role: 'organizer' });
        const totalStudents = await User.countDocuments({ role: 'student' });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalEvents,
                totalOrganizers,
                totalStudents
            }
        });
    } catch (error) {
        next(error);
    }
};
