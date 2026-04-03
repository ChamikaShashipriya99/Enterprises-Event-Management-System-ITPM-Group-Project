// backend/routes/pointRoutes.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const Booking = require('../models/Booking');

// ── Level helper ──────────────────────────────────────────────────────────────
const getLevel = (attendedCount) => {
    if (attendedCount >= 10) return { name: 'Gold',   emoji: '🥇', min: 10, next: null,  color: '#f59e0b' };
    if (attendedCount >= 5)  return { name: 'Silver', emoji: '🥈', min: 5,  next: 10,   color: '#94a3b8' };
    if (attendedCount >= 1)  return { name: 'Bronze', emoji: '🥉', min: 1,  next: 5,    color: '#b45309' };
    return                          { name: 'Unranked', emoji: '⭐', min: 0, next: 1,    color: '#64748b' };
};

// ── GET /api/points/my-points ─────────────────────────────────────────────────
// Protected — student only
router.get(
    '/my-points',
    protect,
    authorizeRoles('student'),
    async (req, res) => {
        try {
            const attendedBookings = await Booking.find({
                student: req.user._id,
                status: 'attended',
            })
                .populate('event', 'title date location image')
                .sort({ checkedInAt: -1 });

            const attendedCount = attendedBookings.length;
            const totalPoints   = attendedCount * 10;
            const level         = getLevel(attendedCount);

            const history = attendedBookings.map((b) => ({
                bookingId:   b.bookingId,
                eventTitle:  b.event?.title    || 'Unknown Event',
                eventDate:   b.event?.date     || null,
                eventLocation: b.event?.location || '',
                checkedInAt: b.checkedInAt,
                pointsEarned: 10,
            }));

            res.json({
                success: true,
                data: {
                    totalPoints,
                    attendedCount,
                    level,
                    history,
                },
            });
        } catch (err) {
            console.error('Points fetch error:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch points' });
        }
    }
);

module.exports = router;
