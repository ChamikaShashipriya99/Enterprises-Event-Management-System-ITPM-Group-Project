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
    disableMfa
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const passport = require('passport');
const generateToken = require('../utils/generateToken');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/verifyemail/:token', verifyEmail);

// MFA Routes
router.post('/mfa/generate', protect, generateMfaSecret);
router.post('/mfa/verify', protect, verifyMfaSetup);
router.post('/mfa/disable', protect, disableMfa);

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const token = generateToken(req.user);
        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?token=${token}`);
    }
);

module.exports = router;
