// frontend/src/pages/AdminDashboard.jsx
// UPDATED: Adds booking stats card and Booking Management quick link.
// All existing stat cards are preserved. Only 2 additions made.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../services/eventService';
import bookingService from '../services/bookingService';   // NEW

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalEvents: 0,
        totalOrganizers: 0,
        totalStudents: 0
    });
    // NEW: booking summary
    const [bookingStats, setBookingStats] = useState({ total: 0, attended: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [eventRes, bookRes] = await Promise.all([
                    eventService.getAdminStats(),
                    bookingService.getAllBookings()       // NEW
                ]);
                setStats(eventRes.data);
                // NEW: derive quick stats from bookings list
                const bookings = bookRes.data || [];
                setBookingStats({
                    total: bookings.length,
                    attended: bookings.filter(b => b.status === 'attended').length
                });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching admin stats:', error);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>Loading stats...</div>;

    const statCards = [
        { title: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#6366f1' },
        { title: 'Total Events', value: stats.totalEvents, icon: '📅', color: '#a855f7' },
        { title: 'System Organizers', value: stats.totalOrganizers, icon: '🏗️', color: '#ec4899' },
        { title: 'Active Students', value: stats.totalStudents, icon: '🎓', color: '#10b981' },
        // NEW stat card
        { title: 'Total Bookings', value: bookingStats.total, icon: '🎟️', color: '#f59e0b' },
    ];

    return (
        <div style={{ padding: '2rem 5%' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', fontWeight: '800' }}>Admin <span style={{ color: '#6366f1' }}>Dashboard</span></h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                {statCards.map((card, index) => (
                    <div key={index} className="glass-card" style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        transition: 'transform 0.3s ease',
                        cursor: 'default'
                    }}>
                        <div style={{ fontSize: '2rem' }}>{card.icon}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>{card.title}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: card.color }}>{card.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Existing cards — untouched */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>User Management</h3>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>View and manage all registered users in the system.</p>
                    <Link to="/admin/users" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                        Manage Users
                    </Link>
                </div>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Event Oversight</h3>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Monitor and oversee all events across the platform.</p>
                    <Link to="/admin/events" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
                        Manage Events
                    </Link>
                </div>
                {/* NEW: Booking Management card */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Booking Management</h3>
                    <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
                        Track all reservations, check-ins, and certificates issued.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f59e0b' }}>{bookingStats.total}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Bookings</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#34d399' }}>{bookingStats.attended}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Attended</div>
                        </div>
                    </div>
                    <Link to="/admin/bookings" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        View All Bookings
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
