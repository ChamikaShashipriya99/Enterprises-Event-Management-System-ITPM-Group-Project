const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('passport');
require('./config/passport')(passport);

const path = require('path');

const app = express();

connectDB();

// Initialize automated background jobs
require('./utils/cronJobs');

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const lostItemRoutes = require('./routes/lostItemRoutes');
const chatRoutes = require('./routes/chatRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const pointRoutes  = require('./routes/pointRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/lost-found', lostItemRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/points', pointRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const http = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./utils/socketHandler');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:5173", // Replace with your frontend URL if different
        methods: ["GET", "POST"]
    },
});

socketHandler(io);
app.set('io', io);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
