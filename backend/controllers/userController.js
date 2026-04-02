const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profilePicture: user.profilePicture,
            registeredEvents: user.registeredEvents,
            certificates: user.certificates,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        
        // Allow clearing phone or profilePicture explicitly
        if (req.body.phone !== undefined) user.phone = req.body.phone;
        if (req.body.profilePicture !== undefined) user.profilePicture = req.body.profilePicture;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            profilePicture: updatedUser.profilePicture,
            token: generateToken(updatedUser),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Delete user profile
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        await User.findByIdAndDelete(req.user._id);
        res.json({ message: 'User account deleted' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = { getUserProfile, updateUserProfile, deleteUserProfile };
