const mongoose = require('mongoose');

const volunteerAssignmentSchema = new mongoose.Schema({
    volunteer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    event: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event', 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'declined'], 
        default: 'pending' 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('VolunteerAssignment', volunteerAssignmentSchema);
