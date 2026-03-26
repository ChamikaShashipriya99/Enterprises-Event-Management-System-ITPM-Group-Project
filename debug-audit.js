require('dotenv').config();
const mongoose = require('mongoose');
const AuditLog = require('./backend/models/AuditLog');
const User = require('./backend/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/event-management-system';

const debug = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const logs = await AuditLog.find({}).populate('admin', 'name email role').sort({ createdAt: -1 }).limit(10);
        
        console.log('--- LATEST 10 LOGS ---');
        logs.forEach((log, index) => {
            console.log(`\nLog #${index + 1}:`);
            console.log(`Action: ${log.action}`);
            console.log(`Actor Name: ${log.admin?.name || 'NULL'}`);
            console.log(`Actor Role: ${log.admin?.role || 'NULL'}`);
            console.log(`Details: ${log.details}`);
        });

        process.exit();
    } catch (error) {
        console.error('Debug failed:', error);
        process.exit(1);
    }
};

debug();
