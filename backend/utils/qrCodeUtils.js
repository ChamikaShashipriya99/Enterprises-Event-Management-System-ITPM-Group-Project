const QRCode = require('qrcode');

/**
 * Generate a QR code as a Base64 data URL string
 * The QR code encodes a JSON payload with booking details for verification.
 *
 * @param {Object} params
 * @param {string} params.bookingId   - Unique booking reference
 * @param {string} params.eventId     - Event ObjectId
 * @param {string} params.studentId   - Student ObjectId
 * @returns {{ qrCode: string, qrCodeData: string }}
 */
const generateQRCode = async ({ bookingId, eventId, studentId }) => {
    const payload = JSON.stringify({
        bookingId,
        eventId,
        studentId,
        issuedAt: new Date().toISOString(),
    });

    const qrCodeDataURL = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 2,
        color: {
            dark: '#1E1B4B',
            light: '#FFFFFF',
        },
        width: 256,
    });

    return {
        qrCode: qrCodeDataURL,   // base64 PNG for storage / email embedding
        qrCodeData: payload,      // raw JSON string for check-in verification
    };
};

/**
 * Decode and validate QR code data string
 * @param {string} qrCodeData - Raw data string from the QR scan
 * @returns {{ bookingId, eventId, studentId, issuedAt }}
 */
const decodeQRCode = (qrCodeData) => {
    try {
        const parsed = JSON.parse(qrCodeData);
        if (!parsed.bookingId || !parsed.eventId || !parsed.studentId) {
            throw new Error('Invalid QR code payload');
        }
        return parsed;
    } catch {
        throw new Error('Malformed QR code data');
    }
};

module.exports = { generateQRCode, decodeQRCode };
