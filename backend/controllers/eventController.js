const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Organizer
exports.createEvent = async (req, res, next) => {
    try {
        req.body.organizer = req.user.id;
        const event = await Event.create(req.body);

        // Notify Students
        const students = await User.find({ role: 'student' });
        for (const student of students) {
            await Notification.create({
                user: student._id,
                message: `New Event Alert 🎉: An Organizer just published a new event titled '${event.title}'. Book your spot before it fills up!`,
                isRead: false,
                link: `/events/${event._id}`
            });
        }

        // Notify Admins
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            await Notification.create({
                user: admin._id,
                message: `Moderation Alert: An Organizer just created a new event titled '${event.title}'.`,
                isRead: false
            });
        }

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
            returnDocument: 'after',
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
        const events = await Event.find().populate('organizer', 'name email profilePicture');
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

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private/Student
exports.registerForEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        // Check if user is already registered
        if (event.registeredUsers.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'Already registered for this event' });
        }

        // Check capacity
        if (event.registeredUsers.length >= event.capacity) {
            return res.status(400).json({ success: false, message: 'Event is at full capacity' });
        }

        // Add user to event
        event.registeredUsers.push(req.user.id);
        await event.save();

        // Add event to user's registeredEvents
        const user = await User.findById(req.user.id);
        user.registeredEvents.push(event._id);
        await user.save();

        res.status(200).json({ success: true, message: 'Successfully registered for event' });

        // Check if event is now full and notify organizer/admins
        if (event.registeredUsers.length === event.capacity) {
            // Notify Organizer
            await Notification.create({
                user: event.organizer,
                message: `Capacity Alert 🎟️: Your event '${event.title}' has reached its maximum capacity of ${event.capacity} participants.`,
                isRead: false,
                link: `/events/${event._id}`
            });

            // Notify Admins
            const admins = await User.find({ role: 'admin' });
            for (const admin of admins) {
                await Notification.create({
                    user: admin._id,
                    message: `Moderation Alert: The event titled '${event.title}' is now at full capacity (${event.capacity}).`,
                    isRead: false,
                    link: `/event/${event._id}`
                });
            }
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Unregister from an event
// @route   POST /api/events/:id/unregister
// @access  Private/Student
exports.unregisterFromEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        // Check if user is registered
        if (!event.registeredUsers.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'Not registered for this event' });
        }

        // Remove user from event
        event.registeredUsers = event.registeredUsers.filter(userId => userId.toString() !== req.user.id.toString());
        await event.save();

        // Remove event from user's registeredEvents
        const user = await User.findById(req.user.id);
        user.registeredEvents = user.registeredEvents.filter(eventId => eventId.toString() !== event._id.toString());
        await user.save();

        res.status(200).json({ success: true, message: 'Successfully unregistered from event' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all events (Student Discovery)
// @route   GET /api/events
// @access  Private
exports.getEvents = async (req, res, next) => {
    try {
        const events = await Event.find().populate('organizer', 'name email profilePicture');
        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
exports.getEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizer', 'name email profilePicture');
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        res.status(200).json({ success: true, data: event });
    } catch (error) {
        next(error);
    }
};
