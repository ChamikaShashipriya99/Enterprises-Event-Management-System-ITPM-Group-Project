/**
 * Certificate Controller
 * Handles certificate generation, retrieval, download, and email sending
 */

const Certificate = require('../models/Certificate');
const Booking = require('../models/Booking');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const User = require('../models/User');
const { generateCertificate, getCertificateFilePath } = require('../utils/certificateGenerator');
const { sendEmail } = require('../utils/sendEmail');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate certificates for all students who attended a specific event
 * POST /api/certificates/generate-for-event/:eventId
 * Admin and Event Organizer only
 *
 * @param {Object} req - Express request
 * @param {string} req.params.eventId - Event ID
 * @returns {Object} - Summary of generated certificates
 */
exports.generateCertificatesForEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Find event
        const event = await Event.findById(eventId).populate('organizer', 'name email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }

        // Verify permissions
        if (req.user.role === 'organizer' && req.user._id.toString() !== event.organizer._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only generate certificates for events you organize',
            });
        }

        if (!['admin', 'organizer'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Only admins and organizers can generate certificates',
            });
        }

        // Get all attendance records marked as present for this event
        const attendanceRecords = await Attendance.find({
            event: eventId,
            status: 'present',
        })
            .populate('student', 'name email')
            .populate('booking')
            .lean();

        if (attendanceRecords.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No students with attendance records found for this event',
            });
        }

        const certificateResults = {
            total: attendanceRecords.length,
            generated: [],
            failed: [],
            alreadyGenerated: [],
        };

        // Check which students already have certificates
        for (const attendance of attendanceRecords) {
            const existingCert = await Certificate.findOne({
                booking: attendance.booking._id,
                student: attendance.student._id,
            });

            if (existingCert) {
                certificateResults.alreadyGenerated.push({
                    studentName: attendance.student.name,
                    bookingId: attendance.booking.bookingId,
                    certificateId: existingCert.certificateId,
                });
            }
        }

        // Generate certificates for students who don't have one yet
        const attendanceToProcess = attendanceRecords.filter((att) => {
            return !certificateResults.alreadyGenerated.find(
                (alreadyGen) => alreadyGen.bookingId === att.booking.bookingId
            );
        });

        for (const attendance of attendanceToProcess) {
            try {
                // Generate PDF certificate
                const certificateData = {
                    studentName: attendance.student.name,
                    studentEmail: attendance.student.email,
                    eventTitle: event.title,
                    eventDate: event.date,
                    organizerName: event.organizer.name || 'University Administration',
                    attendanceHours: req.body.attendanceHours || 1,
                };

                const { certificateId, filePath } = await generateCertificate(certificateData);

                // Create certificate record in database
                const certificate = new Certificate({
                    certificateId,
                    booking: attendance.booking._id,
                    student: attendance.student._id,
                    event: eventId,
                    filePath,
                });

                await certificate.save();

                // Update booking to mark certificate as generated
                await Booking.findByIdAndUpdate(attendance.booking._id, {
                    certificateGenerated: true,
                    certificatePath: filePath,
                });

                certificateResults.generated.push({
                    certificateId,
                    studentName: attendance.student.name,
                    studentEmail: attendance.student.email,
                });
            } catch (error) {
                certificateResults.failed.push({
                    studentName: attendance.student.name,
                    error: error.message,
                });
                console.error(`Certificate generation failed for ${attendance.student.name}:`, error);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Certificate generation completed',
            eventTitle: event.title,
            data: certificateResults,
        });
    } catch (error) {
        console.error('Generate certificates error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating certificates',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Get all certificates for logged-in student
 * GET /api/certificates/student
 * Students can only view their own certificates
 *
 * @param {Object} req - Express request
 * @returns {Object[]} - Array of student's certificates
 */
exports.getStudentCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({ student: req.user._id })
            .populate('event', 'title date location')
            .populate('booking', 'bookingId')
            .sort('-issuedAt');

        res.status(200).json({
            success: true,
            count: certificates.length,
            data: certificates,
        });
    } catch (error) {
        console.error('Get student certificates error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving your certificates',
        });
    }
};

/**
 * Get certificate details by ID
 * GET /api/certificates/:certificateId
 *
 * @param {Object} req - Express request
 * @param {string} req.params.certificateId - Certificate database ID
 * @returns {Object} - Certificate details
 */
exports.getCertificateDetails = async (req, res) => {
    try {
        const { certificateId } = req.params;

        const certificate = await Certificate.findById(certificateId)
            .populate('student', 'name email')
            .populate('event', 'title date location organizer')
            .populate('booking', 'bookingId');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found',
            });
        }

        // Verify student can only view their own certificate
        if (req.user.role === 'student' && certificate.student._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only view your own certificates',
            });
        }

        res.status(200).json({
            success: true,
            data: certificate,
        });
    } catch (error) {
        console.error('Get certificate details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving certificate details',
        });
    }
};

/**
 * Download certificate PDF
 * GET /api/certificates/:certificateId/download
 * Students can only download their own certificates
 *
 * @param {Object} req - Express request
 * @param {string} req.params.certificateId - Certificate database ID
 */
exports.downloadCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;

        const certificate = await Certificate.findById(certificateId).populate('student');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found',
            });
        }

        // Verify student can only download their own certificate
        if (req.user.role === 'student' && certificate.student._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only download your own certificates',
            });
        }

        // Get full file path
        const filePath = getCertificateFilePath(certificate.filePath);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Certificate file not found on server',
            });
        }

        // Set appropriate headers for PDF download
        const fileName = `${certificate.certificateId}_Certificate.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

        // Stream file to client
        const fileStream = fs.createReadStream(filePath);

        fileStream.on('error', (error) => {
            console.error('File stream error:', error);
            res.status(500).json({
                success: false,
                message: 'Error downloading certificate',
            });
        });

        fileStream.pipe(res);
    } catch (error) {
        console.error('Download certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading certificate',
        });
    }
};

/**
 * Send certificate via email to student
 * POST /api/certificates/:certificateId/send-email
 * Admin, Organizers, and Students can request this
 *
 * @param {Object} req - Express request
 * @param {string} req.params.certificateId - Certificate database ID
 * @returns {Object} - Email sending status
 */
exports.sendCertificateEmail = async (req, res) => {
    try {
        const { certificateId } = req.params;

        const certificate = await Certificate.findById(certificateId)
            .populate('student', 'name email')
            .populate('event', 'title');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found',
            });
        }

        // Verify permissions
        if (req.user.role === 'student' && certificate.student._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only request certificates for your own emails',
            });
        }

        // Get certificate file path
        const filePath = getCertificateFilePath(certificate.filePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Certificate file not found',
            });
        }

        // Prepare email
        const studentName = certificate.student.name;
        const eventTitle = certificate.event.title;
        const recipientEmail = certificate.student.email;

        const emailSubject = `Your Certificate for ${eventTitle}`;
        const emailMessage = `
            <p>Dear ${studentName},</p>
            <p>We are pleased to send you your certificate of attendance for the event <strong>${eventTitle}</strong>.</p>
            <p>Please find your certificate attached to this email.</p>
            <p>Thank you for your participation!</p>
            <p>Best regards,<br/>Event Management System</p>
        `;

        // Send email with attachment
        await sendEmail({
            to: recipientEmail,
            subject: emailSubject,
            html: emailMessage,
            attachments: [
                {
                    filename: `${certificate.certificateId}_Certificate.pdf`,
                    path: filePath,
                },
            ],
        });

        // Update certificate record
        certificate.emailSent = true;
        certificate.emailSentAt = new Date();
        await certificate.save();

        res.status(200).json({
            success: true,
            message: `Certificate sent successfully to ${recipientEmail}`,
            data: {
                certificateId: certificate.certificateId,
                recipientEmail,
                sentAt: certificate.emailSentAt,
            },
        });
    } catch (error) {
        console.error('Send certificate email error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending certificate email',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Get certificate statistics for an event
 * GET /api/certificates/event/:eventId/stats
 * Admin and Event Organizer only
 *
 * @param {Object} req - Express request
 * @param {string} req.params.eventId - Event ID
 * @returns {Object} - Certificate generation statistics
 */
exports.getCertificateStats = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Find event and verify permissions
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }

        if (req.user.role === 'organizer' && req.user._id.toString() !== event.organizer.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only view stats for events you organize',
            });
        }

        const stats = {
            totalCertificatesGenerated: 0,
            totalEmailsSent: 0,
            totalAttendees: 0,
        };

        // Get counts
        const certificates = await Certificate.find({ event: eventId });
        const attendance = await Attendance.find({ event: eventId, status: 'present' });

        stats.totalCertificatesGenerated = certificates.length;
        stats.totalEmailsSent = certificates.filter((c) => c.emailSent).length;
        stats.totalAttendees = attendance.length;

        res.status(200).json({
            success: true,
            data: {
                ...stats,
                eventTitle: event.title,
                generationRate: `${Math.round((stats.totalCertificatesGenerated / stats.totalAttendees) * 100)}%`,
            },
        });
    } catch (error) {
        console.error('Get certificate stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving certificate statistics',
        });
    }
};

module.exports = exports;
