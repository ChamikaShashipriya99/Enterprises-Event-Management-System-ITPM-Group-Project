const cron = require('node-cron');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const sendEmail = require('./sendEmail');

// Run every hour to check for events within the next 24 hours
cron.schedule('0 * * * *', async () => {
    try {
        console.log('--- Running Scheduled Reminder Job ---');
        
        const now = new Date();
        // 24 hours from now
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        // Find events happening within the next 24 hours
        const upcomingEvents = await Event.find({
            date: {
                $gte: now,
                $lte: tomorrow
            }
        });

        if (upcomingEvents.length === 0) {
            console.log('No upcoming events within 24 hours.');
            return;
        }

        let sentCount = 0;

        for (const event of upcomingEvents) {
            // Find bookings for this event that are confirmed and haven't had reminders sent
            const pendingBookings = await Booking.find({
                event: event._id,
                status: 'confirmed',
                reminderSent: false
            }).populate('student', 'name email');

            for (const booking of pendingBookings) {
                if (booking.student && booking.student.email) {
                    const eventDateStr = new Date(event.date).toLocaleDateString();
                    const eventTimeStr = new Date(event.date).toLocaleTimeString();
                    
                    const message = `Hello ${booking.student.name},

This is a friendly reminder that your upcoming event "${event.title}" is happening soon!

Event Details:
- Date: ${eventDateStr}
- Time: ${eventTimeStr}
- Location: ${event.location}

We look forward to seeing you there!

Best regards,
EventBuddy Team`;

                    try {
                        await sendEmail({
                            email: booking.student.email,
                            subject: `Reminder: Upcoming Event - ${event.title}`,
                            message: message
                        });

                        // Mark reminder as sent to avoid duplicate emails on the next hour tick
                        booking.reminderSent = true;
                        await booking.save();
                        sentCount++;
                        
                        console.log(`Reminder sent to ${booking.student.email} for event ${event.title}`);
                    } catch (emailError) {
                        console.error(`Failed to send reminder email to ${booking.student.email}:`, emailError);
                    }
                }
            }
        }
        console.log(`--- Finished Scheduled Reminder Job. Sent ${sentCount} reminders. ---`);
    } catch (error) {
        console.error('Error running scheduled reminder job:', error);
    }
});

module.exports = cron;
