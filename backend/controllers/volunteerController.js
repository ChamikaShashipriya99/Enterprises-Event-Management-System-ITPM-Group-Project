const VolunteerRegistration = require('../models/VolunteerRegistration');
const VolunteerAssignment = require('../models/VolunteerAssignment');

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

// @desc    Get all volunteers for admin dashboard
// @route   GET /api/volunteer/all
// @access  Private/Admin
const getAllVolunteers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }

        const volunteers = await VolunteerRegistration.find()
            .populate('user', 'profilePicture role')
            .lean()
            .sort({ createdAt: -1 });

        const assignments = await VolunteerAssignment.find().populate('event', 'title').lean();
        
        const enhancedVolunteers = volunteers.map(vol => {
            const uidStr = vol.user && vol.user._id ? vol.user._id.toString() : (vol.user ? vol.user.toString() : null);
            const volAssignments = assignments.filter(a => a.volunteer && a.volunteer.toString() === uidStr);
            return {
                ...vol,
                assignments: volAssignments,
                hasAccepted: volAssignments.some(a => a.status === 'accepted'),
                hasDeclined: volAssignments.some(a => a.status === 'declined'),
                hasPending: volAssignments.some(a => a.status === 'pending')
            };
        });
            
        res.json(enhancedVolunteers);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching all volunteers', error: error.message });
    }
};

// @desc    Assign a volunteer to an event (Admin)
// @route   POST /api/volunteer/assign
// @access  Private/Admin
const assignVolunteer = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }
        const { volunteerId, eventId, message } = req.body;
        
        const exists = await VolunteerAssignment.findOne({ volunteer: volunteerId, event: eventId });
        if (exists) {
            return res.status(400).json({ message: 'Volunteer already assigned to this event' });
        }

        const assignment = await VolunteerAssignment.create({
            volunteer: volunteerId,
            event: eventId,
            message
        });

        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Server error assigning volunteer', error: error.message });
    }
};

// @desc    Get assignments for the logged-in user
// @route   GET /api/volunteer/assignments/me
// @access  Private
const getMyAssignments = async (req, res) => {
    try {
        const assignments = await VolunteerAssignment.find({ volunteer: req.user.id })
            .populate('event', 'title date')
            .sort({ createdAt: -1 });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching assignments', error: error.message });
    }
};

// @desc    Update assignment status
// @route   PUT /api/volunteer/assignments/:id/status
// @access  Private
const updateAssignmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'accepted', 'declined'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const assignment = await VolunteerAssignment.findOne({ _id: req.params.id, volunteer: req.user.id });
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        
        assignment.status = status;
        await assignment.save();
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating status', error: error.message });
    }
};

// @desc    Mark all assignments as read
// @route   PUT /api/volunteer/assignments/read-all
// @access  Private
const markAllAssignmentsRead = async (req, res) => {
    try {
        await VolunteerAssignment.updateMany(
            { volunteer: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: 'All assignments marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error marking as read', error: error.message });
    }
};

module.exports = { 
    registerVolunteer, 
    getMyVolunteerData, 
    getAllVolunteers,
    assignVolunteer,
    getMyAssignments,
    updateAssignmentStatus,
    markAllAssignmentsRead
};
