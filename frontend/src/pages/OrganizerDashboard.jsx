import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import eventService from '../services/eventService';
import chatService from '../services/chatService';
import Skeleton from '../components/Skeleton';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';

const OrganizerDashboard = () => {
    const [events, setEvents] = useState([]);
    const [chatStats, setChatStats] = useState({
        activeNow: 0,
        todayMsgs: 0,
        mediaShared: 0,
        moderationActions: 0,
        hourlyActivity: [],
        topContributors: [],
        fileBreakdown: [],
        insights: {
            selfDeletionRate: 0,
            announcementReach: 0
        }
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
            socket.on("message-updated", handleUpdate);
            socket.on("chat-pinned-updated", handleUpdate);
            
            return () => {
                socket.off("message-received", handleUpdate);
                socket.off("message-removed", handleUpdate);
                socket.off("chat-cleared", handleUpdate);
                socket.off("message-updated", handleUpdate);
                socket.off("chat-pinned-updated", handleUpdate);
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
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
                        <Skeleton variant="circle" width="40px" height="40px" style={{ marginBottom: '1rem' }} />
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" height="2rem" />
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {[1, 2].map(i => (
                    <div key={i} className="glass-card" style={{ padding: '2rem' }}>
                        <Skeleton variant="title" width="200px" style={{ marginBottom: '1.5rem' }} />
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="70%" />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '2rem 5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Organizer <span style={{ color: '#a855f7' }}>Dashboard</span></h1>
                <Link to="/create-event" className="btn-primary" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' }}>
                    + Create New Event
                </Link>
            </div>

            {/* Core Stats Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #6366f1' }}>
                    <div style={{ fontSize: '2rem' }}>📅</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>My Events</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6366f1' }}>{events.length}</div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #a855f7' }}>
                    <div style={{ fontSize: '2rem' }}>👥</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>Registrations</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#a855f7' }}>
                        {events.reduce((sum, event) => sum + (event.registeredUsers?.length || 0), 0)}
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '2rem' }}>⚡</div>
                        <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>LIVE</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '500' }}>Active Now</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{chatStats.activeNow}</div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
                    <div style={{ fontSize: '2rem' }}>💬</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '500' }}>Today's Volume</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>{chatStats.todayMsgs}</div>
                </div>
            </div>

            {/* Visual Insights Section */}
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: '700' }}>
                Community <span style={{ color: '#a855f7' }}>Insights</span> 📉
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                {/* 1. Peak Activity Chart */}
                <div className="glass-card" style={{ padding: '2rem', minHeight: '400px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>🕒</span> Peak Activity (Last 24h)
                    </h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                            <AreaChart data={chatStats.hourlyActivity}>
                                <defs>
                                    <linearGradient id="colorOrganizer" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip 
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                                    itemStyle={{ color: '#a855f7' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#a855f7" fillOpacity={1} fill="url(#colorOrganizer)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Top Participants Bar Chart */}
                <div className="glass-card" style={{ padding: '2rem', minHeight: '400px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>🏆</span> Top Participants
                    </h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                            <BarChart data={chatStats.topContributors} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={100} />
                                <Tooltip 
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                />
                                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Moderation Insights */}
                <div className="glass-card" style={{ padding: '2rem', borderLeft: '4px solid #ec4899' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Moderation Impact</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Self-Deletion Rate</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ef4444' }}>{chatStats.insights?.selfDeletionRate}%</div>
                        </div>
                        <div>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Announcement Reach</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#a855f7' }}>{chatStats.insights?.announcementReach}%</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(236, 72, 153, 0.05)', borderRadius: '8px' }}>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                            Track how effectively your moderation actions and announcements are engaging the community.
                        </p>
                    </div>
                </div>

                {/* 4. Content Distribution */}
                <div className="glass-card" style={{ padding: '2rem', minHeight: '300px' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Content Distribution</h3>
                    <div style={{ width: '100%', height: '200px' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={chatStats.fileBreakdown}
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chatStats.fileBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#a855f7', '#6366f1', '#10b981', '#f59e0b'][index % 4]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
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
                    <Link to="/chat" className="btn-primary" style={{ marginLeft: 'auto', padding: '8px 15px', fontSize: '0.8rem', textDecoration: 'none', background: '#a855f7' }}>Open Chat</Link>
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
                                alignItems: 'center',
                                borderLeft: '3px solid #a855f7'
                            }}>
                                <div>
                                    <h4 style={{ marginBottom: '0.2rem' }}>{event.title}</h4>
                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(event.date).toLocaleDateString()} | {event.location}</p>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#a855f7', fontWeight: 'bold' }}>
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
