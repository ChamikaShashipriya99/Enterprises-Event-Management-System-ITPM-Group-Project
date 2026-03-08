const { body, validationResult } = require('express-validator');

// Middleware to handle validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg,
            errors: errors.array()
        });
    }
    next();
};

// Auth Validation Rules
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/\d/)
        .withMessage('Password must contain at least one number'),
    body('role').isIn(['student', 'organizer', 'admin']).withMessage('Invalid role'),
    validate
];

const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

const forgotPasswordValidation = [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    validate
];

const resetPasswordValidation = [
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    validate
];

// User Validation Rules
const updateProfileValidation = [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone')
        .optional({ checkFalsy: true })
        .matches(/^\+?[\d\s-]{10,}$/)
        .withMessage('Please provide a valid phone number'),
    body('password')
        .optional({ checkFalsy: true })
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long'),
    validate
];

// Event Validation Rules
const eventValidation = [
    body('title').trim().notEmpty().withMessage('Event title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('date')
        .isISO8601()
        .withMessage('Please provide a valid date')
        .custom((value) => {
            if (new Date(value) < new Date()) {
                throw new Error('Event date must be in the future');
            }
            return true;
        }),
    body('capacity')
        .isInt({ min: 1 })
        .withMessage('Capacity must be at least 1'),
    validate
];

module.exports = {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    updateProfileValidation,
    eventValidation
};
