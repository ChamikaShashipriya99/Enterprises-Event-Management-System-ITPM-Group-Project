const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const verifyAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const User = mongoose.model('User', new mongoose.Schema({
            isVerified: Boolean,
            email: String
        }));

        const result = await User.updateMany(
            { isVerified: false },
            { $set: { isVerified: true } }
        );

        console.log(`Success! ${result.modifiedCount} users verified.`);
        process.exit();
    } catch (err) {
        console.error('Error verifying users:', err);
        process.exit(1);
    }
};

verifyAll();
