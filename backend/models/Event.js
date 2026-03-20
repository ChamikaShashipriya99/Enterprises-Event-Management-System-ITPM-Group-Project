const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add an event title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    date: {
        type: Date,
        required: [true, 'Please add an event date']
    },
    capacity: {
        type: Number,
        required: [true, 'Please add event capacity']
    },
    image: {
        type: String,
        default: '/uploads/default-event.jpg'
    },
    organizer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    registeredUsers: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
