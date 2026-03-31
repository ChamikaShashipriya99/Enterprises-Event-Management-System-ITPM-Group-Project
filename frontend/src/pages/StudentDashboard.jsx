import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import Skeleton from '../components/Skeleton';
import SummaryCard from '../components/SummaryCard';
import EmptyState from '../components/EmptyState';

const StudentDashboard = () => {
    const { currentUser } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch actual bookings using the same endpoint as MyBookings
                const response = await bookingService.getMyBookings();
                setBookings(response.data || response);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return (
        <div style={{ padding: '40px 5%' }}>
            <div style={{ marginBottom: '40px' }}>
                <Skeleton variant="title" width="400px" style={{ marginBottom: '10px' }} />
                <Skeleton variant="text" width="60%" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                {[1, 2, 3].map(i => (
                    <section key={i} className="glass-card" style={{ padding: '30px' }}>
                        <Skeleton variant="title" width="150px" style={{ marginBottom: '20px' }} />
                        {[1, 2].map(j => (
                            <div key={j} style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '15px' }}>
                                <Skeleton variant="text" width="70%" />
                                <Skeleton variant="text" width="40%" />
                            </div>
                        ))}
                    </section>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '40px 5%' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: '800' }}>Student <span style={{ color: '#6366f1' }}>Dashboard</span></h1>
                <p style={{ color: '#94a3b8' }}>Welcome back, {currentUser?.name}. Track your learning and participation.</p>
            </div>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <SummaryCard
                    icon="📅"
                    label="Events Registered"
                    value={bookings.filter(b => b.status === 'confirmed').length}
                    color="#6366f1"
                />
                <SummaryCard
                    icon="🎓"
                    label="Certificates Earned"
                    value={currentUser?.certificates?.length || 0}
                    color="#10b981"
                />
                <SummaryCard
                    icon="✓"
                    label="Attended Events"
                    value={bookings.filter(b => b.status === 'attended').length}
                    color="#f59e0b"
                />
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                {/* Registered Events */}
                <section className="glass-card" style={{ padding: '30px' }}>
                    <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                        <span>📅</span> Registered Events
                    </h2>
                    {bookings.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {bookings.slice(0, 5).map((booking) => (
                                <Link
                                    key={booking._id}
                                    to={`/events/${booking.event?._id}`}
                                    style={{
                                        padding: '15px',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #6366f1',
                                        textDecoration: 'none',
                                        color: 'white',
                                        transition: 'transform 0.2s, background 0.2s',
                                        display: 'block'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateX(5px)';
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateX(0)';
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    }}
                                >
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{booking.event?.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>📍 {booking.event?.location} • 📅 {new Date(booking.event?.date).toLocaleDateString()}</div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon="📭"
                            title="No Events Yet"
                            description="Browse and book upcoming events to get started."
                            actionLabel="Browse Events"
                            onAction={() => window.location.href = '/events'}
                        />
                    )}
                </section>

                {/* Certificates */}
                <section className="glass-card" style={{ padding: '30px' }}>
                    <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                        <span>🎓</span> My Certificates
                    </h2>
                    {currentUser?.certificates?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {currentUser.certificates.slice(0, 3).map((cert, index) => (
                                <div key={index} style={{
                                    padding: '15px',
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(10, 120, 80, 0.05) 100%)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderLeft: '4px solid #10b981'
                                }}>
                                    <span style={{ fontWeight: '500' }}>{cert}</span>
                                    <Link to="/certificates" style={{ fontSize: '0.75rem', color: '#10b981', textDecoration: 'none', fontWeight: '600' }}>
                                        View →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon="📜"
                            title="No Certificates Yet"
                            description="Attend events and check in to earn certificates."
                        />
                    )}
                </section>

                {/* Quick Links */}
                <section className="glass-card" style={{ padding: '30px' }}>
                    <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                        <span>⚡</span> Quick Links
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Link to="/events" style={{
                            padding: '12px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            color: '#818cf8',
                            fontWeight: '500',
                            transition: 'background 0.2s',
                            display: 'block',
                            textAlign: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                        >
                            🔍 Browse All Events
                        </Link>
                        <Link to="/my-bookings" style={{
                            padding: '12px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            color: '#6ee7b7',
                            fontWeight: '500',
                            transition: 'background 0.2s',
                            display: 'block',
                            textAlign: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                        >
                            🎫 My Bookings
                        </Link>
                        <Link to="/certificates" style={{
                            padding: '12px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            color: '#fbbf24',
                            fontWeight: '500',
                            transition: 'background 0.2s',
                            display: 'block',
                            textAlign: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'}
                        >
                            🏆 My Certificates
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default StudentDashboard;
