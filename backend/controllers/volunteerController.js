const VolunteerRegistration = require('../models/VolunteerRegistration');

// @desc    Register a volunteer
// @route   POST /api/volunteer/register
// @access  Private
const registerVolunteer = async (req, res) => {
    const { fullName, email, phone, skills, availability } = req.body;

    // Backend Validation
    if (!fullName || !/^[a-zA-Z\s]+$/.test(fullName)) {
        return res.status(400).json({ message: 'Name can contain only spaces and letters' });
    }

    if (!email || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
        return res.status(400).json({ message: 'Email address must be a @gmail.com type' });
    }

    if (!phone || !/^\d{10}$/.test(phone)) {
        return res.status(400).json({ message: 'Phone number must contain exactly 10 digits' });
    }

    if (!skills || skills.length === 0) {
        return res.status(400).json({ message: 'Please select at least one skill' });
    }

    if (!availability) {
        return res.status(400).json({ message: 'Please select at least one time availability slot' });
    }

    // Check if at least one slot is true
    let hasAvailability = false;
    for (const day in availability) {
        for (const slot in availability[day]) {
            if (availability[day][slot] === true) {
                hasAvailability = true;
                break;
            }
        }
        if (hasAvailability) break;
    }

    if (!hasAvailability) {
        return res.status(400).json({ message: 'Please select at least one time availability slot' });
    }

    try {
        const registrationData = {
            user: req.user._id,
            fullName,
            email,
            phone,
            skills,
            availability
        };

        const updatedRegistration = await VolunteerRegistration.findOneAndUpdate(
            { user: req.user._id },
            { $set: registrationData },
            { new: true, upsert: true }
        );

        res.status(200).json(updatedRegistration);
    } catch (error) {
        res.status(500).json({ message: 'Failed to register volunteer', error: error.message });
    }
};

// @desc    Get logged in user's volunteer data
// @route   GET /api/volunteer/me
// @access  Private
const getMyVolunteerData = async (req, res) => {
    try {
        const volunteerData = await VolunteerRegistration.findOne({ user: req.user._id });
        
        if (!volunteerData) {
            return res.status(404).json({ message: 'Volunteer registration not found' });
        }
        
        res.json(volunteerData);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching volunteer data', error: error.message });
    }
};

module.exports = { registerVolunteer, getMyVolunteerData };
