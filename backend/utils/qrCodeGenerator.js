/**
 * QR Code Generation Utility
 * Generates unique QR codes for event bookings with encoded booking information
 * QR codes contain booking verification data for check-in scanning
 */

const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate unique QR code for booking check-in
 * QR data includes: bookingId, studentId, eventId, timestamp
 * This creates a tamper-resistant token that can be validated server-side
 *
 * @param {string} bookingId - Unique booking identifier
 * @param {string} studentId - MongoDB ObjectId of student
 * @param {string} eventId - MongoDB ObjectId of event
 * @param {string} studentEmail - Student email for verification
 * @returns {Promise<Object>} - Contains qrCodeData string and qrCodeImage (base64)
 * @throws {Error} - If QR generation fails
 */
async function generateQRCode(bookingId, studentId, eventId, studentEmail) {
    try {
        // Create unique QR data with timestamp for freshness
        const qrData = {
            bookingId,
            studentId,
            eventId,
            studentEmail,
            generatedAt: new Date().toISOString(),
            checksum: uuidv4(), // Random checksum for tamper detection
        };

        // Convert to JSON string for QR encoding
        const qrDataString = JSON.stringify(qrData);

        // Generate QR code as Base64 image
        // error_correction: 'H' = High (can recover from up to 30% damage)
        // type: 'image/png' = PNG format
        // width: 500 = Pixel size
        // margin: 2 = Quiet zone
        const qrCodeImage = await QRCode.toDataURL(qrDataString, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.95,
            margin: 2,
            width: 500,
        });

        return {
            qrCodeData: qrDataString,
            qrCodeImage, // Base64 string ready for display
        };
    } catch (error) {
        throw new Error(`QR Code generation failed: ${error.message}`);
    }
}

/**
 * Validate QR code string and extract booking information
 * Verifies the QR data structure and content integrity
 *
 * @param {string} scannedQRData - Raw QR data string from scanner
 * @returns {Object} - Parsed QR data object
 * @throws {Error} - If QR data is invalid or corrupted
 */
function validateAndParseQRCode(scannedQRData) {
    try {
        // Parse JSON from QR data
        const qrData = JSON.parse(scannedQRData);

        // Validate required fields
        const requiredFields = ['bookingId', 'studentId', 'eventId', 'studentEmail', 'checksum'];
        for (const field of requiredFields) {
            if (!qrData[field]) {
                throw new Error(`Missing required QR field: ${field}`);
            }
        }

        return qrData;
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error('Invalid QR code format: Data is corrupted');
        }
        throw error;
    }
}

/**
 * Compare scanned QR data with booking database record
 * Ensures the QR matches the actual booking in the system
 *
 * @param {Object} scannedQRData - Parsed QR data from scanner
 * @param {Object} bookingRecord - Booking document from database
 * @returns {boolean} - True if QR matches booking
 */
function verifyQRMatchesBooking(scannedQRData, bookingRecord) {
    // Verify all critical identifiers match
    return (
        scannedQRData.bookingId === bookingRecord.bookingId &&
        scannedQRData.studentId === bookingRecord.student.toString() &&
        scannedQRData.eventId === bookingRecord.event.toString()
    );
}

module.exports = {
    generateQRCode,
    validateAndParseQRCode,
    verifyQRMatchesBooking,
};
