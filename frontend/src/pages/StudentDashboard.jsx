import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import eventService from '../services/eventService';
import Skeleton from '../components/Skeleton';
import { 
    Calendar, 
    Award, 
    Star, 
    MessageCircle, 
    MapPin, 
    Clock, 
    ChevronRight,
    Search,
    Download,
    CheckCircle2,
    MessageSquare
} from 'lucide-react';

const StudentDashboard = () => {
    const { currentUser, refreshProfile, unreadCount } = useContext(AuthContext);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                await refreshProfile();
                const response = await eventService.getAllEvents();
                const allEvents = response.data;
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

    const statCards = [
        { title: 'Registered Events', value: registeredEvents.length, icon: <Calendar size={24} />, color: '#6366f1' },
        { title: 'Certificates Earned', value: currentUser?.certificates?.length || 0, icon: <Award size={24} />, color: '#10b981' },
        { title: 'Upcoming Today', value: registeredEvents.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).length, icon: <Star size={24} />, color: '#f59e0b' },
        { title: 'Community Messages', value: unreadCount, icon: <MessageCircle size={24} />, color: '#a855f7' }
    ];

    if (loading) return (
        <div style={{ padding: '40px 5%' }}>
            <div style={{ marginBottom: '40px' }}>
                <Skeleton variant="title" width="400px" style={{ marginBottom: '10px' }} />
                <Skeleton variant="text" width="60%" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                {[1, 2, 3, 4].map(i => <Skeleton key={i} height="120px" variant="rect" />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '30px' }}>
                <Skeleton height="400px" variant="rect" />
                <Skeleton height="400px" variant="rect" />
            </div>
        </div>
    );

    return (
        <div style={{ padding: '40px 5%', maxWidth: '1600px', margin: '0 auto' }}>
            {/* Header section */}
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.8rem', marginBottom: '8px', fontWeight: '900', letterSpacing: '-1px' }}>
                        Student <span style={{ background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hub</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Welcome back, <span style={{ color: 'white', fontWeight: '600' }}>{currentUser?.name}</span>. Here's your activity overview.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                        <Calendar size={16} />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: '20px', 
                marginBottom: '40px' 
            }}>
                {statCards.map((stat, idx) => (
                    <div key={idx} className="glass-card" style={{ 
                        padding: '24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '20px',
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        cursor: 'default'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ 
                            width: '56px', 
                            height: '56px', 
                            borderRadius: '14px', 
                            background: `${stat.color}15`, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: stat.color,
                            border: `1px solid ${stat.color}30`
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500', marginBottom: '4px' }}>{stat.title}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white' }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1.5fr) minmax(300px, 1fr))', 
                gap: '30px' 
            }}>
                {/* Left Column: Events */}
                <section className="glass-card" style={{ padding: '30px', borderTop: '4px solid #6366f1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Calendar size={24} style={{ color: '#6366f1' }} /> My Schedule
                        </h2>
                        <Link to="/events" style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            Explore More <ChevronRight size={14} />
                        </Link>
                    </div>

                    {registeredEvents.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {registeredEvents.map((event) => (
                                <Link
                                    key={event._id}
                                    to={`/events/${event._id}`}
                                    style={{
                                        padding: '20px',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        textDecoration: 'none',
                                        color: 'white',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        e.currentTarget.style.borderColor = '#6366f130';
                                        e.currentTarget.style.transform = 'scale(1.01)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{event.title}</div>
                                        <span style={{ 
                                            fontSize: '0.7rem', 
                                            padding: '4px 8px', 
                                            background: '#6366f120', 
                                            color: '#818cf8', 
                                            borderRadius: '4px', 
                                            textTransform: 'uppercase', 
                                            fontWeight: '700',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <CheckCircle2 size={10} /> Active
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {event.location}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '4px' }}>
                                        <div style={{ height: '100%', width: '40%', background: '#6366f1', borderRadius: '2px' }}></div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '15px', color: '#64748b' }}><Search size={48} style={{ margin: '0 auto' }} /></div>
                            <h3 style={{ marginBottom: '10px' }}>No events yet</h3>
                            <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '0.9rem' }}>You haven't registered for any events. Discover new opportunities today!</p>
                            <Link to="/events" className="btn-primary">Browse Events</Link>
                        </div>
                    )}
                </section>

                {/* Right Column: Certificates & Community */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <section className="glass-card" style={{ padding: '30px', borderTop: '4px solid #10b981' }}>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Award size={24} style={{ color: '#10b981' }} /> Achievements
                        </h2>
                        {currentUser?.certificates?.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px' }}>
                                {currentUser.certificates.map((cert, index) => (
                                    <div key={index} style={{
                                        padding: '20px',
                                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(16, 185, 129, 0.2)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        gap: '12px'
                                    }}>
                                        <Award size={32} style={{ color: '#10b981' }} />
                                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'white' }}>{cert}</div>
                                        <button style={{
                                            padding: '6px 14px',
                                            background: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}><Download size={14} /> Download</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center' }}>
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Participate in events to unlock your professional certificates.</p>
                            </div>
                        )}
                    </section>

                    <section className="glass-card" style={{ padding: '30px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: '0.05' }}><MessageCircle size={100} /></div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '15px', color: 'white' }}>Community Chat</h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.6' }}>
                            Join {unreadCount > 0 ? unreadCount : 'active'} conversations with mentors and peers.
                        </p>
                        <Link to="/chat" className="btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
                            Open Chatroom
                        </Link>
                    </section>
                </div>
            </div>

            {/* Floating Chat Button */}
            <Link to="/chat" className="floating-chat-btn" title="Open Chat" style={{ 
                width: '64px', height: '64px', fontSize: '1.8rem',
                animation: 'float 3s ease-in-out infinite' 
            }}>
                <MessageSquare size={32} />
                {unreadCount > 0 && (
                    <span className="floating-badge" style={{ top: '-2px', right: '-2px' }}>{unreadCount}</span>
                )}
            </Link>

            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </div>
    );
};

export default StudentDashboard;
