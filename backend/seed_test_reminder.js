const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Event = require('./models/Event');
const Booking = require('./models/Booking');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('Connected to DB');
        
        // Find or create a user
        let user = await User.findOne({ email: 'test_student_reminder@example.com' });
        if (!user) {
            user = await User.create({
                name: 'Test Student Reminder',
                email: 'test_student_reminder@example.com',
                password: 'password123',
                role: 'student',
                roleCode: '1A'
            });
        }
        
        let organizer = await User.findOne({ role: 'organizer' });
        
        // Remove older test events to keep things clean
        await Event.deleteMany({ title: 'Test Reminder Event 24h' });
        
        // Create an event happening exactly in 23.5 hours
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
        
        const event = await Event.create({
            title: 'Test Reminder Event 24h',
            description: 'This is a test event to verify the email reminders.',
            location: 'Virtual Test',
            date: tomorrow,
            capacity: 10,
            organizer: organizer ? organizer._id : user._id
        });
        
        await Booking.create({
            event: event._id,
            student: user._id,
            status: 'confirmed',
            reminderSent: false
        });
        
        console.log('Successfully seeded test event happening in ~23.5 hours and created a booking with reminderSent: false.');
        process.exit(0);
    })
    .catch(err => {
        console.error('Migration error:', err);
        process.exit(1);
    });
