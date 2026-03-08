const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from current directory
const envPath = path.join(__dirname, '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env file:', result.error.message);
    process.exit(1);
}

dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = process.env.MONGO_URI;
if (!uri) {
    console.error('MONGO_URI is not defined in .env');
    process.exit(1);
}

console.log('Testing connection to:', uri.replace(/:([^@]+)@/, ':****@')); // Hide password

mongoose.connect(uri, { family: 4 })
    .then(() => {
        console.log('SUCCESS: Connected to MongoDB Atlas');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE:', err.message);
        process.exit(1);
    });
