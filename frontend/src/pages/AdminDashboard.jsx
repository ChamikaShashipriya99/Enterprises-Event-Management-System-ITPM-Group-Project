import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../services/eventService';
import Skeleton from '../components/Skeleton';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalEvents: 0,
        totalOrganizers: 0,
        totalStudents: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await eventService.getAdminStats();
                setStats(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching admin stats:', error);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div style={{ padding: '2rem 5%' }}>
            <Skeleton variant="title" width="400px" style={{ marginBottom: '2rem' }} />

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
                        <Skeleton variant="circle" width="40px" height="40px" style={{ marginBottom: '0.5rem' }} />
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="30%" height="2rem" />
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {[1, 2].map(i => (
                    <div key={i} className="glass-card" style={{ padding: '2rem' }}>
                        <Skeleton variant="title" width="200px" style={{ marginBottom: '1rem' }} />
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="80%" style={{ marginBottom: '1.5rem' }} />
                        <Skeleton width="150px" height="40px" />
                    </div>
                ))}
            </div>
        </div>
    );

    const statCards = [
        { title: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#6366f1' },
        { title: 'Total Events', value: stats.totalEvents, icon: '📅', color: '#a855f7' },
        { title: 'System Organizers', value: stats.totalOrganizers, icon: '🏗️', color: '#ec4899' },
        { title: 'Active Students', value: stats.totalStudents, icon: '🎓', color: '#10b981' }
    ];

    return (
        <div style={{ padding: '2rem 5%' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', fontWeight: '800' }}>Admin <span style={{ color: '#6366f1' }}>Dashboard</span></h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
            </div>
        </div>
    );
};

export default AdminDashboard;
