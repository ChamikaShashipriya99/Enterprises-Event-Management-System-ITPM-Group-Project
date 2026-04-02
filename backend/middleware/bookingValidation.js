const { body, param, validationResult } = require('express-validator');

/**
 * Returns a middleware that checks validation results and sends 400 if errors exist.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
    }
    next();
};

/**
 * Validation rules for creating a booking
 */
const validateCreateBooking = [
    body('eventId')
        .notEmpty().withMessage('Event ID is required')
        .isMongoId().withMessage('Invalid Event ID format'),
    validate,
];

/**
 * Validation rules for cancelling a booking
 */
const validateCancelBooking = [
    param('bookingId')
        .notEmpty().withMessage('Booking ID is required')
        .matches(/^BK-[A-Z0-9]+-\d+$/).withMessage('Invalid booking ID format'),
    body('reason')
        .optional()
        .isLength({ max: 500 }).withMessage('Cancellation reason cannot exceed 500 characters')
        .trim(),
    validate,
];

/**
 * Validation rules for QR check-in
 */
const validateCheckIn = [
    body('qrCodeData')
        .notEmpty().withMessage('QR code data is required')
        .isString().withMessage('QR code data must be a string'),
    validate,
];

/**
 * Validation rules for certificate generation
 */
const validateGenerateCertificate = [
    param('bookingId')
        .notEmpty().withMessage('Booking ID is required'),
    body('sendEmail')
        .optional()
        .isBoolean().withMessage('sendEmail must be a boolean'),
    validate,
];

module.exports = {
    validateCreateBooking,
    validateCancelBooking,
    validateCheckIn,
    validateGenerateCertificate,
};
