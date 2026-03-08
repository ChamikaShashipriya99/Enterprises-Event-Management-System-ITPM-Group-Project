const express = require('express');
const router = express.Router();
const {
    registerUser,
    authUser,
    forgotPassword,
    resetPassword,
    verifyEmail,
    generateMfaSecret,
    verifyMfaSetup,
    disableMfa,
    getSessions,
    revokeSession,
    logoutAllDevices
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation
} = require('../middleware/validationMiddleware');

const passport = require('passport');
const generateToken = require('../utils/generateToken');

router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, authUser);
router.post('/forgotpassword', forgotPasswordValidation, forgotPassword);
router.put('/resetpassword/:resettoken', resetPasswordValidation, resetPassword);
router.get('/verifyemail/:token', verifyEmail);

// MFA Routes
router.post('/mfa/generate', protect, generateMfaSecret);
router.post('/mfa/verify', protect, verifyMfaSetup);
router.post('/mfa/disable', protect, disableMfa);

// Session Management Routes
router.get('/sessions', protect, getSessions);
router.delete('/sessions/:sessionId', protect, revokeSession);
router.delete('/sessions', protect, logoutAllDevices);

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const UAParser = require('ua-parser-js');
        const crypto = require('crypto');

        const parser = new UAParser(req.headers['user-agent']);
        const ua = parser.getResult();
        const sessionId = crypto.randomBytes(16).toString('hex');

        // Create session in background (we don't await because passport is a bit different here, 
        // but we'll try to update the user object)
        const user = req.user;
        user.sessions.push({
            sessionId,
            device: ua.device.model || ua.device.vendor || 'Desktop',
            browser: ua.browser.name,
            os: ua.os.name,
            ip: req.ip || req.connection.remoteAddress,
        });

        // Save the user with the new session
        user.save().then(() => {
            const token = generateToken(user, sessionId);
            // Redirect to frontend with token
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/login?token=${token}`);
        }).catch(err => {
            console.error('Failed to save session for Google login', err);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=session_error`);
        });
    }
);

module.exports = router;
