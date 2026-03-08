const Booking = require('../models/Booking');
const Event = require('../models/Event');

const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

const isSameDay = (d1, d2) => {
    const a = new Date(d1);
    const b = new Date(d2);
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
};

//Check Seat Availability

// @desc    Check available seats for an event
// @route   GET /api/bookings/availability/:eventId
// @access  Private (student)
exports.checkAvailability = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Check if event is in the past
        if (new Date(event.date) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'This event has already taken place',
            });
        }

        const confirmedBookings = await Booking.countDocuments({
            event: event._id,
            status: 'confirmed',
        });

        const availableSeats = event.capacity - confirmedBookings;

        return res.status(200).json({
            success: true,
            data: {
                eventId: event._id,
                eventTitle: event.title,
                eventDate: event.date,
                totalCapacity: event.capacity,
                confirmedBookings,
                availableSeats,
                isAvailable: availableSeats > 0,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


// Create Booking

// @desc    Book a seat for an event
// @route   POST /api/bookings
// @access  Private (student)
exports.createBooking = async (req, res) => {
    try {
        const { eventId } = req.body;
        const studentId = req.user._id;

        // 1. Validate event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // 2. Prevent booking for past events
        if (new Date(event.date) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book a seat for a past event',
            });
        }

        // 3. Prevent booking on event day
        if (isSameDay(event.date, new Date())) {
            return res.status(400).json({
                success: false,
                message: 'Bookings are not accepted on the day of the event',
            });
        }

        // 4. Check for duplicate booking (same student + same event)
        const existingBooking = await Booking.findOne({
            event: eventId,
            student: studentId,
            status: { $ne: 'cancelled' },
        });
        if (existingBooking) {
            return res.status(409).json({
                success: false,
                message: 'You have already booked a seat for this event',
                bookingId: existingBooking.bookingId,
            });
        }

        // 5. Check seat availability (prevent overbooking)
        const confirmedBookings = await Booking.countDocuments({
            event: eventId,
            status: 'confirmed',
        });
        if (confirmedBookings >= event.capacity) {
            return res.status(400).json({
                success: false,
                message: 'No seats available. This event is fully booked',
            });
        }

        // 6. Generate unique bookingId
        const bookingId = `BK-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`;

        // 7. Generate QR code

        // 8. Create booking
        const booking = await Booking.create({
            bookingId,
            event: eventId,
            student: studentId,
            //qrCode,
            //qrCodeData,
            status: 'confirmed',
        });

        // 9. Add event to student's registeredEvents
        await User.findByIdAndUpdate(studentId, {
            $addToSet: { registeredEvents: eventId },
        });

        // 10. Populate for email

        // 11. Send confirmation email (non-blocking)
        return res.status(201).json({
            success: true,
            message: 'Booking confirmed successfully',
            data: {
                bookingId: booking.bookingId,
                status: booking.status,
                event: {
                    id: event._id,
                    title: event.title,
                    date: event.date,
                    location: event.location,
                },
                qrCode: booking.qrCode,
                createdAt: booking.createdAt,
            },
        });
    } catch (error) {
        // Handle MongoDB duplicate key error (race condition safety net)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'You have already booked a seat for this event',
            });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

//Cancel Booking

// @desc    Cancel a booking
// @route   PUT /api/bookings/:bookingId/cancel
// @access  Private (student)
exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { reason } = req.body;
        const studentId = req.user._id;

        // 1. Find booking
        const booking = await Booking.findOne({ bookingId }).populate('event');
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // 2. Ensure ownership
        if (booking.student.toString() !== studentId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to cancel this booking',
            });
        }

        // 3. Already cancelled check
        if (booking.status === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
        }

        // 4. Attended bookings cannot be cancelled
        if (booking.status === 'attended') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a booking for an event you have already attended',
            });
        }

        // 5. Prevent cancellation ON the event day
        if (isSameDay(booking.event.date, new Date())) {
            return res.status(400).json({
                success: false,
                message: 'Cancellations are not allowed on the day of the event',
            });
        }

        // 6. Prevent cancellation for past events
        if (new Date(booking.event.date) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a booking for an event that has already passed',
            });
        }

        // 7. Update booking
        booking.status = 'cancelled';
        booking.cancelledAt = new Date();
        booking.cancellationReason = reason || 'No reason provided';
        await booking.save();

        // 8. Remove from student's registeredEvents
        await User.findByIdAndUpdate(studentId, {
            $pull: { registeredEvents: booking.event._id },
        });

        // 9. Send cancellation email (non-blocking)

        return res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: {
                bookingId: booking.bookingId,
                status: booking.status,
                cancelledAt: booking.cancelledAt,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get Student's Bookings

// @desc    Get all bookings for the logged-in student
// @route   GET /api/bookings/my-bookings
// @access  Private (student)
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ student: req.user._id })
            .populate('event', 'title date location capacity')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single Booking

// @desc    Get a single booking by bookingId
// @route   GET /api/bookings/:bookingId
// @access  Private (student or admin)
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findOne({ bookingId: req.params.bookingId })
            .populate('event', 'title date location capacity organizer')
            .populate('student', 'name email');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Students can only view their own bookings
        if (
            req.user.role === 'student' &&
            booking.student._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking',
            });
        }

        return res.status(200).json({ success: true, data: booking });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


