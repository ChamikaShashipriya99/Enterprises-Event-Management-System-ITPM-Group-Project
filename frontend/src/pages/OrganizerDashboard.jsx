import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import eventService from '../services/eventService';
import chatService from '../services/chatService';
import Skeleton from '../components/Skeleton';

const OrganizerDashboard = () => {
    const [events, setEvents] = useState([]);
    const [chatStats, setChatStats] = useState({
        activeNow: 0,
        todayMsgs: 0,
        mediaShared: 0,
        moderationActions: 0
    });
    const [loading, setLoading] = useState(true);
    const { currentUser, socket, unreadCount } = useContext(AuthContext);

    const fetchStats = async (showLoading = false) => {
        try {
            if (showLoading) setLoading(true);
            const [eventRes, chatRes] = await Promise.all([
                eventService.getMyEvents(),
                chatService.getChatStats(currentUser.token)
            ]);
            setEvents(eventRes.data);
            setChatStats(chatRes);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats(true);

        if (socket) {
            const handleUpdate = () => fetchStats(false);
            socket.on("message-received", handleUpdate);
            socket.on("message-removed", handleUpdate);
            socket.on("chat-cleared", handleUpdate);
            
            return () => {
                socket.off("message-received", handleUpdate);
                socket.off("message-removed", handleUpdate);
                socket.off("chat-cleared", handleUpdate);
            };
        }
    }, [socket, currentUser]);

    if (loading) return (
        <div style={{ padding: '2rem 5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Skeleton variant="title" width="300px" />
                <Skeleton width="150px" height="45px" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <Skeleton variant="circle" width="40px" height="40px" style={{ marginBottom: '1rem' }} />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" height="2rem" />
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <Skeleton variant="circle" width="40px" height="40px" style={{ marginBottom: '1rem' }} />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" height="2rem" />
                </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <Skeleton variant="title" width="200px" style={{ marginBottom: '1.5rem' }} />
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '1rem' }}>
                        <Skeleton variant="text" width="40%" />
                        <Skeleton variant="text" width="70%" />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '2rem 5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Organizer <span style={{ color: '#6366f1' }}>Dashboard</span></h1>
                <Link to="/create-event" className="btn-primary" style={{ textDecoration: 'none' }}>
                    + Create New Event
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem' }}>📅</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>My Events</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6366f1' }}>{events.length}</div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem' }}>👥</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>Total Registrations</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#a855f7' }}>
                        {events.reduce((sum, event) => sum + (event.registeredUsers?.length || 0), 0)}
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '2rem' }}>⚡</div>
                        <span style={{ fontSize: '0.7rem', color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>LIVE</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '500' }}>Active Now</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{chatStats.activeNow}</div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem' }}>💬</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '500' }}>Today's Volume</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>{chatStats.todayMsgs}</div>
                </div>
            </div>

            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: '700', marginTop: '3rem' }}>
                Moderation <span style={{ color: '#6366f1' }}>Overview</span> 🛡️
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ fontSize: '2.5rem' }}>📢</div>
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Announcement Mode</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ready to broadcast to students</div>
                    </div>
                    <Link to="/chat" className="btn-primary" style={{ marginLeft: 'auto', padding: '8px 15px', fontSize: '0.8rem', textDecoration: 'none' }}>Open Chat</Link>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ fontSize: '2.5rem' }}>🧹</div>
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Chat Sanitization</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Moderation tools enabled</div>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem' }}>Recent Events</h3>
                    <Link to="/organizer-events" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '0.9rem' }}>View All</Link>
                </div>

                {events.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No events created yet. Start by creating your first event!</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {events.slice(0, 3).map(event => (
                            <div key={event._id} style={{
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h4 style={{ marginBottom: '0.2rem' }}>{event.title}</h4>
                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(event.date).toLocaleDateString()} | {event.location}</p>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#6366f1', fontWeight: 'bold' }}>
                                    {event.registeredUsers?.length || 0} Registered
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Chat Button */}
            <Link to="/chat" className="floating-chat-btn" title="Open Chat">
                💬
                {(unreadCount || 0) > 0 && (
                    <span className="floating-badge">{unreadCount}</span>
                )}
            </Link>
        </div>
    );
};

export default OrganizerDashboard;
