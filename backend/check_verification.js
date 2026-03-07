const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const email = 'admin@gmail.com'; // Adjust to the user from the screenshot if known
        const user = await User.findOne({ email });
        if (user) {
            console.log(`User: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`isVerified: ${user.isVerified}`);
            console.log(`verificationToken: ${user.verificationToken}`);
        } else {
            console.log('User not found');
        }
        process.exit();
    })
    .catch(err => {
        console.error('Database connection error:', err);
        process.exit(1);
    });
