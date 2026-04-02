const Booking = require('../models/Booking');
const Certificate = require('../models/Certificate');
const Event = require('../models/Event');
const User = require('../models/User');
const { generateQRCode, decodeQRCode } = require('../utils/qrCodeUtils');
const { generateCertificatePDF } = require('../utils/certificateUtils');
const {
    sendBookingConfirmationEmail,
    sendCancellationEmail,
    sendCertificateEmail,
} = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isSameDay = (d1, d2) => {
    const a = new Date(d1);
    const b = new Date(d2);
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
};

// ─── Check Seat Availability ──────────────────────────────────────────────────

exports.checkAvailability = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (new Date(event.date) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'This event has already taken place',
            });
        }

        // FIX: count both 'confirmed' and 'attended' so checked-in bookings
        // are not dropped from the tally on the organizer dashboard
        const confirmedBookings = await Booking.countDocuments({
            event: event._id,
            status: { $in: ['confirmed', 'attended'] },
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

// ─── Create Booking ────────────────────────────────────────────────────────────

exports.createBooking = async (req, res) => {
    try {
        const { eventId } = req.body;
        const studentId = req.user._id;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (new Date(event.date) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book a seat for a past event',
            });
        }

        if (isSameDay(event.date, new Date())) {
            return res.status(400).json({
                success: false,
                message: 'Bookings are not accepted on the day of the event',
            });
        }

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

        // FIX: count both 'confirmed' and 'attended' so a fully-attended event
        // cannot accidentally accept new bookings once everyone checks in
        const confirmedBookings = await Booking.countDocuments({
            event: eventId,
            status: { $in: ['confirmed', 'attended'] },
        });
        if (confirmedBookings >= event.capacity) {
            return res.status(400).json({
                success: false,
                message: 'No seats available. This event is fully booked',
            });
        }

        const bookingId = `BK-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`;

        const { qrCode, qrCodeData } = await generateQRCode({
            bookingId,
            eventId: event._id.toString(),
            studentId: studentId.toString(),
        });

        const booking = await Booking.create({
            bookingId,
            event: eventId,
            student: studentId,
            qrCode,
            qrCodeData,
            status: 'confirmed',
        });

        await User.findByIdAndUpdate(studentId, {
            $addToSet: { registeredEvents: eventId },
        });

        const student = await User.findById(studentId);

        sendBookingConfirmationEmail({
            to: student.email,
            studentName: student.name,
            booking,
            event,
        }).catch((err) => console.error('Confirmation email error:', err));

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
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'You have already booked a seat for this event',
            });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Cancel Booking ────────────────────────────────────────────────────────────

exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { reason } = req.body;
        const studentId = req.user._id;

        const booking = await Booking.findOne({ bookingId }).populate('event');
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.student.toString() !== studentId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to cancel this booking',
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
        }

        if (booking.status === 'attended') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a booking for an event you have already attended',
            });
        }

        if (isSameDay(booking.event.date, new Date())) {
            return res.status(400).json({
                success: false,
                message: 'Cancellations are not allowed on the day of the event',
            });
        }

        if (new Date(booking.event.date) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a booking for an event that has already passed',
            });
        }

        booking.status = 'cancelled';
        booking.cancelledAt = new Date();
        booking.cancellationReason = reason || 'No reason provided';
        await booking.save();

        await User.findByIdAndUpdate(studentId, {
            $pull: { registeredEvents: booking.event._id },
        });

        const student = await User.findById(studentId);
        sendCancellationEmail({
            to: student.email,
            studentName: student.name,
            booking,
            event: booking.event,
            reason: booking.cancellationReason,
        }).catch((err) => console.error('Cancellation email error:', err));

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

// ─── Get Student's Bookings ────────────────────────────────────────────────────

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

// ─── Get Single Booking ────────────────────────────────────────────────────────

exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findOne({ bookingId: req.params.bookingId })
            .populate('event', 'title date location capacity organizer')
            .populate('student', 'name email');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (
            req.user.role === 'student' &&
            booking.student._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking',
            });
        }

        let certificateId = null;
        const cert = await require('../models/Certificate').findOne({ booking: booking._id });
        if (cert) certificateId = cert.certificateId;

        const bookingData = booking.toObject();
        bookingData.certificateId = certificateId;

        return res.status(200).json({ success: true, data: bookingData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── QR Check-In ──────────────────────────────────────────────────────────────

exports.checkIn = async (req, res) => {
    try {
        const { qrCodeData } = req.body;

        if (!qrCodeData) {
            return res.status(400).json({ success: false, message: 'QR code data is required' });
        }

        let decoded;
        try {
            decoded = decodeQRCode(qrCodeData);
        } catch {
            return res.status(400).json({ success: false, message: 'Invalid or malformed QR code' });
        }

        const { bookingId, eventId, studentId } = decoded;

        const booking = await Booking.findOne({ bookingId })
            .populate('event', 'title date location')
            .populate('student', 'name email');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (
            booking.event._id.toString() !== eventId ||
            booking.student._id.toString() !== studentId
        ) {
            return res.status(400).json({ success: false, message: 'QR code data mismatch' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'This booking has been cancelled',
            });
        }

        if (booking.checkedIn) {
            return res.status(400).json({
                success: false,
                message: `Student already checked in at ${booking.checkedInAt}`,
            });
        }

        booking.status = 'attended';
        booking.checkedIn = true;
        booking.checkedInAt = new Date();
        await booking.save();

        return res.status(200).json({
            success: true,
            message: 'Check-in successful. Attendance recorded.',
            data: {
                bookingId: booking.bookingId,
                student: {
                    name: booking.student.name,
                    email: booking.student.email,
                },
                event: {
                    title: booking.event.title,
                    date: booking.event.date,
                },
                checkedInAt: booking.checkedInAt,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Admin: Get All Bookings ───────────────────────────────────────────────────

exports.getAllBookings = async (req, res) => {
    try {
        const { status, eventId } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (eventId) filter.event = eventId;

        const bookings = await Booking.find(filter)
            .populate('event', 'title date location')
            .populate('student', 'name email')
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

// ─── Certificate Generation ────────────────────────────────────────────────────

exports.generateCertificate = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { sendEmail = false } = req.body;

        const booking = await Booking.findOne({ bookingId })
            .populate('event', 'title date location')
            .populate('student', 'name email');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.student._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this certificate',
            });
        }

        if (booking.status !== 'attended') {
            return res.status(400).json({
                success: false,
                message: 'Certificate is only available after attending the event',
            });
        }

        // Idempotent — return existing certificate if already generated
        const existingCert = await Certificate.findOne({ booking: booking._id });
        if (existingCert) {
            if (sendEmail && !existingCert.emailSent) {
                try {
                    await sendCertificateEmail({
                        to: booking.student.email,
                        studentName: booking.student.name,
                        event: booking.event,
                        certificatePath: path.resolve(existingCert.filePath),
                    });
                    existingCert.emailSent = true;
                    existingCert.emailSentAt = new Date();
                    await existingCert.save();
                } catch (emailErr) {
                    console.error('Certificate email error (retry):', emailErr.message);
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Certificate already generated',
                data: {
                    certificateId: existingCert.certificateId,
                    downloadPath: `/api/bookings/certificate/download/${existingCert.certificateId}`,
                    emailSent: existingCert.emailSent,
                },
            });
        }

        const certificateId = `CERT-${uuidv4().toUpperCase()}`;
        const outputDir = path.resolve(__dirname, '..', 'certificates');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const filePath = await generateCertificatePDF({
            studentName: booking.student.name,
            eventTitle: booking.event.title,
            eventDate: booking.event.date,
            eventLocation: booking.event.location,
            certificateId,
            outputDir,
        });

        if (!fs.existsSync(filePath)) {
            return res.status(500).json({
                success: false,
                message: 'Certificate PDF generation failed — file not found after generation',
            });
        }

        const certificate = await Certificate.create({
            certificateId,
            booking: booking._id,
            student: booking.student._id,
            event: booking.event._id,
            filePath,
        });

        booking.certificateGenerated = true;
        booking.certificatePath = filePath;
        await booking.save();

        if (sendEmail) {
            try {
                await sendCertificateEmail({
                    to: booking.student.email,
                    studentName: booking.student.name,
                    event: booking.event,
                    certificatePath: path.resolve(filePath),
                });
                certificate.emailSent = true;
                certificate.emailSentAt = new Date();
                await certificate.save();
            } catch (emailErr) {
                console.error('Certificate email failed:', emailErr);
            }
        }

        return res.status(201).json({
            success: true,
            message: 'Certificate generated successfully',
            data: {
                certificateId: certificate.certificateId,
                downloadPath: `/api/bookings/certificate/download/${certificate.certificateId}`,
                emailSent: certificate.emailSent,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Certificate Download ──────────────────────────────────────────────────────

exports.downloadCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findOne({
            certificateId: req.params.certificateId,
        });

        if (!certificate) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }

        if (
            req.user.role === 'student' &&
            certificate.student.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to download this certificate',
            });
        }

        const absolutePath = path.resolve(certificate.filePath);

        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({
                success: false,
                message: 'Certificate file not found on server. Please regenerate.',
            });
        }

        return res.download(
            absolutePath,
            `certificate_${certificate.certificateId}.pdf`,
            (err) => {
                if (err) {
                    console.error('Certificate download error:', err);
                    if (!res.headersSent) {
                        res.status(500).json({ success: false, message: 'Download failed' });
                    }
                }
            }
        );
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Admin: Booking Stats ──────────────────────────────────────────────────────

exports.getBookingStats = async (req, res) => {
    try {
        const stats = await Booking.aggregate([
            {
                $group: {
                    _id: '$event',
                    total: { $sum: 1 },
                    confirmedBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
                    },
                    attendedBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'attended'] }, 1, 0] },
                    },
                    cancelledBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
                    },
                },
            },
            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'event',
                },
            },
            { $unwind: '$event' },
            {
                $project: {
                    _id: 0,
                    eventId: '$_id',
                    eventTitle: '$event.title',
                    eventDate: '$event.date',
                    capacity: '$event.capacity',
                    total: 1,
                    confirmedBookings: 1,
                    attendedBookings: 1,
                    cancelledBookings: 1,
                },
            },
            { $sort: { eventDate: -1 } },
        ]);

        return res.status(200).json({ success: true, data: stats });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
