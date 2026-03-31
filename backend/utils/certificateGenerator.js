/**
 * Certificate PDF Generation Utility
 * Creates professional digital certificates for event attendance
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Directory for storing generated certificates
const CERTIFICATES_DIR = path.join(__dirname, '../certificates');

// Ensure certificates directory exists
if (!fs.existsSync(CERTIFICATES_DIR)) {
    fs.mkdirSync(CERTIFICATES_DIR, { recursive: true });
}

/**
 * Generate a professional digital certificate for event attendance
 * Creates a PDF with student name, event details, and certificate ID
 *
 * @param {Object} certificateData - Certificate information
 * @param {string} certificateData.studentName - Name of attendee
 * @param {string} certificateData.studentEmail - Email of attendee
 * @param {string} certificateData.eventTitle - Title of event
 * @param {Date} certificateData.eventDate - Date event occurred
 * @param {string} certificateData.organizerName - Name of event organizer/company
 * @param {number} certificateData.attendanceHours - Duration of event (optional)
 * @returns {Promise<Object>} - Contains certificateId and filePath
 * @throws {Error} - If certificate generation fails
 */
async function generateCertificate(certificateData) {
    return new Promise((resolve, reject) => {
        try {
            const {
                studentName,
                studentEmail,
                eventTitle,
                eventDate,
                organizerName = 'University Administration',
                attendanceHours = 1,
            } = certificateData;

            // Generate unique certificate ID
            const certificateId = `CERT-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`;

            // Create safe filename from student email and certificate ID
            const fileName = `${studentName.replace(/\s+/g, '_')}_${certificateId}.pdf`;
            const filePath = path.join(CERTIFICATES_DIR, fileName);

            // Create PDF document
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 50,
            });

            // Create file stream
            const stream = fs.createWriteStream(filePath);

            doc.on('error', (err) => {
                reject(new Error(`PDF generation error: ${err.message}`));
            });

            stream.on('error', (err) => {
                reject(new Error(`File stream error: ${err.message}`));
            });

            // Pipe PDF to file
            doc.pipe(stream);

            // Set PDF metadata
            doc.info({
                Title: `Certificate of Attendance - ${eventTitle}`,
                Author: organizerName,
                Subject: `Event Attendance Certificate`,
                Keywords: 'certificate, attendance, event',
            });

            // Add decorative border
            doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke('#1f3a70');
            doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70).stroke('#1f3a70');

            // Header - Issue organization
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .text(organizerName, { align: 'center' });

            doc.fontSize(11)
                .font('Helvetica')
                .text('Office of Events & Student Engagement', { align: 'center' })
                .moveDown(1);

            // Title
            doc.fontSize(28)
                .font('Helvetica-Bold')
                .fillColor('#1f3a70')
                .text('Certificate of Attendance', { align: 'center' })
                .fillColor('black')
                .moveDown(1.5);

            // Body text
            doc.fontSize(12)
                .font('Helvetica')
                .text('This is to certify that', { align: 'center' })
                .moveDown(0.5);

            // Student name
            doc.fontSize(18)
                .font('Helvetica-Bold')
                .fillColor('#1f3a70')
                .text(studentName, { align: 'center', underline: true })
                .fillColor('black')
                .moveDown(0.5);

            // Certificate text
            doc.fontSize(12)
                .font('Helvetica')
                .text(
                    `has successfully attended the event: "${eventTitle}"`,
                    { align: 'center' }
                )
                .moveDown(0.5);

            // Event details
            const eventDateFormatted = eventDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            doc.fontSize(11)
                .text(`Event Date: ${eventDateFormatted}`, { align: 'center' })
                .text(`Duration: ${attendanceHours} hour(s)`, { align: 'center' })
                .moveDown(2);

            // Signature section
            doc.fontSize(10)
                .text(
                    'This certificate is issued in recognition of participation and contribution to this event.',
                    { align: 'center', width: doc.page.width - 100, continued: false }
                )
                .moveDown(1.5);

            // Certificate ID and date
            const issuedDate = new Date();
            const issuedDateFormatted = issuedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            doc.fontSize(9)
                .fillColor('#666666')
                .text(`Certificate ID: ${certificateId}`, { align: 'center' })
                .text(`Issued: ${issuedDateFormatted}`, { align: 'center' })
                .fillColor('black')
                .moveDown(1);

            // Footer
            doc.fontSize(8)
                .fillColor('#999999')
                .text('This certificate is valid and authentic only when downloaded from the official platform.', {
                    align: 'center',
                    fontSize: 8,
                })
                .fillColor('black');

            // Finalize PDF
            doc.end();

            // Wait for stream to finish
            stream.on('finish', () => {
                resolve({
                    certificateId,
                    filePath: `certificates/${fileName}`, // Store relative path in DB
                    fileName,
                });
            });
        } catch (error) {
            reject(new Error(`Certificate generation failed: ${error.message}`));
        }
    });
}

/**
 * Get full file path for certificate download
 * Validates that file exists before returning
 *
 * @param {string} relativePath - Relative path stored in database
 * @returns {string} - Full absolute path to certificate file
 * @throws {Error} - If file doesn't exist
 */
function getCertificateFilePath(relativePath) {
    const fullPath = path.join(__dirname, '..', relativePath);

    if (!fs.existsSync(fullPath)) {
        throw new Error('Certificate file not found');
    }

    return fullPath;
}

/**
 * Delete certificate file from storage
 * Used for cleanup if certificate needs to be regenerated
 *
 * @param {string} relativePath - Relative path to certificate
 * @returns {boolean} - True if deletion successful
 */
function deleteCertificateFile(relativePath) {
    try {
        const fullPath = path.join(__dirname, '..', relativePath);

        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            return true;
        }

        return false;
    } catch (error) {
        console.error(`Error deleting certificate: ${error.message}`);
        return false;
    }
}

module.exports = {
    generateCertificate,
    getCertificateFilePath,
    deleteCertificateFile,
    CERTIFICATES_DIR,
};
