const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    // Email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (!password) {
        return res.status(400).json({ message: 'Please provide a password' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
        name,
        email,
        password,
        role,
        verificationToken,
    });

    if (user) {
        // Send verification email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;
        const message = `Welcome to EventBuddy! Please verify your email by clicking the link below:\n\n${verificationUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Email Verification',
                message,
            });
            res.status(201).json({
                message: 'Registration successful! Please check your email to verify your account.',
            });
        } catch (err) {
            console.error('Initial email failed, but user created:', err);
            res.status(201).json({
                message: 'Registration successful! However, we could not send the verification email. Please contact support.',
            });
        }
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is verified
    if (!user.isVerified) {
        return res.status(401).json({
            message: 'Please verify your email to login. Check your inbox for the verification link.'
        });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
        const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
        return res.status(403).json({
            message: `Account is locked. Please try again in ${remainingMinutes} minutes.`
        });
    }

    if (await user.matchPassword(password)) {
        // Successful login
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        user.lastLogin = Date.now();
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user),
        });
    } else {
        // Failed login
        user.loginAttempts += 1;

        if (user.loginAttempts >= 5) {
            // Lock account for 15 minutes
            user.lockUntil = Date.now() + 15 * 60 * 1000;
            await user.save();
            return res.status(403).json({
                message: 'Too many failed attempts. Account locked for 15 minutes.'
            });
        }

        await user.save();
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(404).json({ message: 'No user with that email' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a put request to: \n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message,
        });

        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return res.status(500).json({ message: 'Email could not be sent' });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user),
    });
};

// @desc    Verify email
// @route   GET /api/auth/verifyemail/:token
// @access  Public
const verifyEmail = async (req, res) => {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
        return res.status(400).json({ message: 'Invalid verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully!' });
};

module.exports = { registerUser, authUser, forgotPassword, resetPassword, verifyEmail };
