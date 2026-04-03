const mongoose = require('mongoose');

const volunteerRegistrationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        skills: {
            type: [String],
            required: true,
        },
        availability: {
            type: Object,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const VolunteerRegistration = mongoose.model('VolunteerRegistration', volunteerRegistrationSchema);
module.exports = VolunteerRegistration;
