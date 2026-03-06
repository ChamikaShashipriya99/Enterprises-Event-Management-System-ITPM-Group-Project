import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import eventService from '../services/eventService';

const StudentDashboard = () => {
    const { currentUser, refreshProfile } = useContext(AuthContext);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Refresh profile to get latest registeredEvents IDs
                await refreshProfile();

                // Fetch all events and filter for ones the user is in
                const response = await eventService.getAllEvents();
                const allEvents = response.data;

                // Since user.registeredEvents might be just IDs or full objects depending on population
                // we filter allEvents based on membership
                const userEvents = allEvents.filter(event =>
                    event.registeredUsers?.includes(currentUser?._id)
                );

                setRegisteredEvents(userEvents);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchDashboardData();
        }
    }, []);

    if (loading) return <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;

    return (
        <div style={{ padding: '40px 5%' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: '800' }}>Student <span style={{ color: '#6366f1' }}>Dashboard</span></h1>
                <p style={{ color: '#94a3b8' }}>Welcome back, {currentUser?.name}. Track your learning and participation.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                <section className="glass-card" style={{ padding: '30px' }}>
                    <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                        <span style={{ color: '#6366f1' }}>📅</span> Registered Events
                    </h2>
                    {registeredEvents.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {registeredEvents.map((event) => (
                                <Link
                                    key={event._id}
                                    to={`/events/${event._id}`}
                                    style={{
                                        padding: '15px',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #6366f1',
                                        textDecoration: 'none',
                                        color: 'white',
                                        transition: 'transform 0.2s',
                                        display: 'block'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                                >
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{event.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>📍 {event.location} • 📅 {new Date(event.date).toLocaleDateString()}</div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>No events registered yet. Start exploring!</p>
                            <Link to="/events" className="btn-primary" style={{ padding: '10px 20px', textDecoration: 'none', fontSize: '0.9rem' }}>
                                Browse Events
                            </Link>
                        </div>
                    )}
                </section>

                <section className="glass-card" style={{ padding: '30px' }}>
                    <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                        <span style={{ color: '#10b981' }}>🎓</span> My Certificates
                    </h2>
                    {currentUser?.certificates?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {currentUser.certificates.map((cert, index) => (
                                <div key={index} style={{
                                    padding: '15px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>{cert}</span>
                                    <button className="btn-primary" style={{
                                        padding: '5px 12px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        color: '#10b981',
                                        border: '1px solid #10b981',
                                        fontSize: '0.8rem'
                                    }}>Download</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#64748b' }}>Complete events to earn certificates.</p>
                    )}
                </section>

                <section className="glass-card" style={{ padding: '30px' }}>
                    <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                        <span style={{ color: '#f59e0b' }}>🕒</span> Event History
                    </h2>
                    <p style={{ color: '#64748b' }}>Your past event participations will appear here for easy access.</p>
                    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                        Feature Coming Soon
                    </div>
                </section>
            </div>
        </div>
    );
};

export default StudentDashboard;
