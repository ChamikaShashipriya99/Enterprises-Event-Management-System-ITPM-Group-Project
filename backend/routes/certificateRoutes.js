/**
 * Certificate Routes
 * Routes for certificate generation, retrieval, download, and email sending
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const certificateController = require('../controllers/certificateController');

/**
 * POST /api/certificates/generate-for-event/:eventId
 * Generate certificates for all attendees of a completed event
 * Access: Admin, Event Organizer
 */
router.post(
    '/generate-for-event/:eventId',
    protect,
    authorizeRoles('admin', 'organizer'),
    certificateController.generateCertificatesForEvent
);

/**
 * GET /api/certificates/student
 * Get all certificates for logged-in student
 * Access: Student
 */
router.get('/student', protect, authorizeRoles('student'), certificateController.getStudentCertificates);

/**
 * GET /api/certificates/:certificateId
 * Get certificate details by ID
 * Access: Admin, Organizer, Student (own certificate)
 */
router.get('/:certificateId', protect, certificateController.getCertificateDetails);

/**
 * GET /api/certificates/:certificateId/download
 * Download certificate PDF
 * Access: Admin, Organizer, Student (own certificate)
 */
router.get('/:certificateId/download', protect, certificateController.downloadCertificate);

/**
 * POST /api/certificates/:certificateId/send-email
 * Send certificate via email to student
 * Access: Admin, Organizer, Student (own certificate)
 */
router.post('/:certificateId/send-email', protect, certificateController.sendCertificateEmail);

/**
 * GET /api/certificates/event/:eventId/stats
 * Get certificate generation statistics for an event
 * Access: Admin, Event Organizer
 */
router.get('/event/:eventId/stats', protect, authorizeRoles('admin', 'organizer'), certificateController.getCertificateStats);

module.exports = router;
