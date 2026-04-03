const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

const VolunteerRegistration = require('./backend/models/VolunteerRegistration');
const VolunteerAssignment = require('./backend/models/VolunteerAssignment');
require('./backend/models/Event');
require('./backend/models/User');

const testDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const volunteers = await VolunteerRegistration.find()
            .populate('user', 'profilePicture role')
            .lean()
            .sort({ createdAt: -1 });

        const assignments = await VolunteerAssignment.find().populate('event', 'title').lean();
        console.log('Assignments:', JSON.stringify(assignments, null, 2));

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
        
        console.log('First Enhanced Volunteer Assignments:', JSON.stringify(enhancedVolunteers[0]?.assignments, null, 2));
        
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
}

testDb();
