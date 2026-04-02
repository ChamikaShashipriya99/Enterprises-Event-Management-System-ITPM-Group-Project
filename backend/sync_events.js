const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const Booking = require('./models/Booking');

dotenv.config();

const syncRegisteredUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const events = await Event.find();
        console.log(`Processing ${events.length} events...`);

        for (const event of events) {
            const bookings = await Booking.find({ 
                event: event._id, 
                status: { $in: ['confirmed', 'attended'] } 
            });
            
            const studentIds = bookings.map(b => b.student);
            
            event.registeredUsers = studentIds;
            await event.save();
            console.log(`Synced ${studentIds.length} users for event: ${event.title}`);
        }

        console.log('Sync complete!');
        process.exit(0);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
};

syncRegisteredUsers();
