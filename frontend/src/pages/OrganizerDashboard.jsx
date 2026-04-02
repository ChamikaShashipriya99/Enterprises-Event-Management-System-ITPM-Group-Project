import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import eventService from '../services/eventService';
import bookingService from '../services/bookingService';
import chatService from '../services/chatService';
import Skeleton from '../components/Skeleton';
import { 
    Calendar, 
    Users, 
    Zap, 
    MessageSquare, 
    Clock, 
    Trophy, 
    ShieldCheck, 
    PieChart as PieChartIcon,
    Plus,
    LayoutDashboard,
    TrendingUp,
    MapPin,
    MessageCircleMore
} from 'lucide-react';
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
    const [bookingStats, setBookingStats] = useState({});
    // bookingStats shape: { [eventId]: { totalCapacity, confirmedBookings, availableSeats } }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await eventService.getMyEvents();
                const myEvents = response.data || [];
                setEvents(myEvents);

                // For each event, call /availability/:eventId — accessible to all auth users
                const statsEntries = await Promise.all(
                    myEvents.map(async (event) => {
                        try {
                            const res = await bookingService.checkAvailability(event._id);
                            return [event._id, res.data];
                        } catch {
                            return [event._id, { totalCapacity: event.capacity, confirmedBookings: 0, availableSeats: event.capacity }];
                        }
                    })
                );

                const statsMap = Object.fromEntries(statsEntries);
                setBookingStats(statsMap);
            } catch (error) {
                console.error('Error fetching organizer dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
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

    // Derived totals
    const totalBooked   = Object.values(bookingStats).reduce((sum, s) => sum + (s.confirmedBookings || 0), 0);
    const totalCapacity = Object.values(bookingStats).reduce((sum, s) => sum + (s.totalCapacity || 0), 0);
    const totalAvail    = Object.values(bookingStats).reduce((sum, s) => sum + (s.availableSeats || 0), 0);

    if (loading) return (
        <div style={{ padding: '2rem 5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ height: '40px', width: '300px', background: 'rgba(255,255,255,0.07)', borderRadius: '8px' }} />
                <div style={{ height: '45px', width: '150px', background: 'rgba(255,255,255,0.07)', borderRadius: '8px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card" style={{ padding: '1.5rem', height: '110px' }}>
                        <div style={{ height: '20px', width: '40%', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', marginBottom: '8px' }} />
                        <div style={{ height: '36px', width: '60%', background: 'rgba(255,255,255,0.07)', borderRadius: '4px' }} />
                    </div>
                ))}
            </div>
            <div className="glass-card" style={{ padding: '2rem' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '1rem' }}>
                        <div style={{ height: '16px', width: '40%', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', marginBottom: '8px' }} />
                        <div style={{ height: '14px', width: '70%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
                        <Skeleton variant="circle" width="40px" height="40px" style={{ marginBottom: '1rem' }} />
                        <Skeleton variant="text" width="60%" />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '2rem 5%' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>
                    Organizer <span style={{ color: '#6366f1' }}>Dashboard</span>
                </h1>
                <Link to="/create-event" className="btn-primary" style={{ textDecoration: 'none' }}>
                    + Create New Event
                </Link>
            </div>

            {/* Stat cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem' }}>📅</div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Organizer <span style={{ color: '#a855f7' }}>Dashboard</span></h1>
                <Link to="/create-event" className="btn-primary" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={20} /> Create New Event
                </Link>
            </div>

            {/* Core Stats Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #6366f1' }}>
                    <div style={{ color: '#6366f1', marginBottom: '10px' }}><Calendar size={28} /></div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>My Events</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{events.length}</div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem' }}>🎟️</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>Total Booked</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#a855f7' }}>{totalBooked}</div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem' }}>💺</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>Total Capacity</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{totalCapacity}</div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem' }}>🟢</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>Seats Available</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24' }}>{totalAvail}</div>
                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #a855f7' }}>
                    <div style={{ color: '#a855f7', marginBottom: '10px' }}><Users size={28} /></div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>Registrations</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                        {events.reduce((sum, event) => sum + (event.registeredUsers?.length || 0), 0)}
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ color: '#f59e0b' }}><Zap size={28} /></div>
                        <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>LIVE</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '500' }}>Active Now</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{chatStats.activeNow}</div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
                    <div style={{ color: '#10b981', marginBottom: '10px' }}><MessageSquare size={28} /></div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '500' }}>Today's Volume</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{chatStats.todayMsgs}</div>
                </div>
            </div>

            {/* Visual Insights Section */}
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
                Community <span style={{ color: '#a855f7' }}>Insights</span> <TrendingUp size={24} style={{ color: '#a855f7' }} />
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                {/* 1. Peak Activity Chart */}
                <div className="glass-card" style={{ padding: '2rem', minHeight: '400px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={18} /> Peak Activity (Last 24h)
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
                        <Trophy size={18} /> Top Participants
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
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShieldCheck size={18} /> Moderation Impact
                    </h3>
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
                </div>

                {/* 4. Content Distribution */}
                <div className="glass-card" style={{ padding: '2rem', minHeight: '300px' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <PieChartIcon size={18} /> Content Distribution
                    </h3>
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

            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: '700', marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                Moderation <span style={{ color: '#6366f1' }}>Overview</span> <ShieldCheck size={24} style={{ color: '#6366f1' }} />
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <MessageSquare size={32} style={{ color: '#a855f7' }} />
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Announcement Mode</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ready to broadcast to students</div>
                    </div>
                    <Link to="/chat" className="btn-primary" style={{ marginLeft: 'auto', padding: '8px 15px', fontSize: '0.8rem', textDecoration: 'none', background: '#a855f7' }}>Open Chat</Link>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <ShieldCheck size={32} style={{ color: '#10b981' }} />
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Chat Sanitization</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Moderation tools enabled</div>
                    </div>
                </div>
            </div>

            {/* Recent Events */}
            <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem' }}>Recent Events</h3>
                    <Link to="/organizer-events" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '0.9rem' }}>
                        View All
                    </Link>
                    <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <LayoutDashboard size={22} /> Recent Events
                    </h3>
                    <Link to="/organizer-events" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '0.9rem' }}>View All</Link>
                </div>

                {events.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
                        No events created yet. Start by creating your first event!
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {events.slice(0, 3).map(event => {
                            const stat = bookingStats[event._id] || {};
                            const booked   = stat.confirmedBookings ?? 0;
                            const capacity = stat.totalCapacity ?? event.capacity ?? 0;
                            const pct      = capacity > 0 ? Math.min((booked / capacity) * 100, 100) : 0;
                            const isFull   = stat.availableSeats === 0;
                            const isPast   = new Date(event.date) < new Date();

                            return (
                                <div key={event._id} style={{
                                    padding: '1rem 1.25rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    flexWrap: 'wrap'
                                }}>
                                    {/* Left: event info */}
                                    <div style={{ flex: 1, minWidth: '180px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{event.title}</h4>
                                            {isPast && (
                                                <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(100,116,139,0.15)', color: '#64748b', fontWeight: '600' }}>
                                                    ENDED
                                                </span>
                                            )}
                                            {isFull && !isPast && (
                                                <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', color: '#f87171', fontWeight: '600' }}>
                                                    FULL
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                                            {new Date(event.date).toLocaleDateString()} &nbsp;·&nbsp; {event.location}
                                        </p>
                                    </div>

                                    {/* Right: booking stats + capacity bar */}
                                    <div style={{ textAlign: 'right', minWidth: '160px' }}>
                                        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'flex-end', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: '600' }}>
                                                🎟️ {booked} Booked
                                            </span>
                                            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>
                                                / {capacity}
                                            </span>
                                        </div>
                                        {/* Capacity fill bar */}
                                        <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px' }}>
                                            <div style={{
                                                width: `${pct}%`,
                                                height: '100%',
                                                borderRadius: '3px',
                                                background: pct >= 90
                                                    ? 'linear-gradient(90deg,#ef4444,#dc2626)'
                                                    : pct >= 60
                                                        ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                                                        : 'linear-gradient(90deg,#6366f1,#a855f7)',
                                                transition: 'width 0.4s ease'
                                            }} />
                                        </div>
                                    </div>
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
                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Clock size={12} /> {new Date(event.date).toLocaleDateString()} | <MapPin size={12} /> {event.location}
                                    </p>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#a855f7', fontWeight: 'bold' }}>
                                    {event.registeredUsers?.length || 0} Registered
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.75rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>⚡ Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                            { label: '📋 Manage My Events', to: '/organizer-events', color: '#818cf8' },
                            { label: '➕ Create New Event',  to: '/create-event',      color: '#a855f7' },
                            { label: '✅ QR Check-In',       to: '/checkin',           color: '#34d399' },
                        ].map(item => (
                            <Link key={item.to} to={item.to} style={{
                                padding: '10px 14px',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                color: item.color,
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                textDecoration: 'none',
                                display: 'block',
                                transition: 'background 0.2s, transform 0.2s'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.75rem' }}>
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>📊 Booking Fill Rate</h3>
                    <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                        Capacity utilisation across all your events
                    </p>
                    {events.length === 0 ? (
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No events yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {events.slice(0, 4).map(event => {
                                const stat  = bookingStats[event._id] || {};
                                const booked   = stat.confirmedBookings ?? 0;
                                const capacity = stat.totalCapacity ?? event.capacity ?? 1;
                                const pct   = Math.min(Math.round((booked / capacity) * 100), 100);
                                return (
                                    <div key={event._id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>
                                                {event.title}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{pct}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px' }}>
                                            <div style={{
                                                width: `${pct}%`,
                                                height: '100%',
                                                borderRadius: '3px',
                                                background: pct >= 90
                                                    ? 'linear-gradient(90deg,#ef4444,#dc2626)'
                                                    : pct >= 60
                                                        ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                                                        : 'linear-gradient(90deg,#6366f1,#a855f7)',
                                                transition: 'width 0.4s ease'
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Chat Button */}
            <Link to="/chat" className="floating-chat-btn" title="Open Chat" style={{ width: '64px', height: '64px' }}>
                <MessageCircleMore size={32} strokeWidth={2.5} />
                {(unreadCount || 0) > 0 && (
                    <span className="floating-badge">{unreadCount}</span>
                )}
            </Link>
        </div>
    );
};

export default OrganizerDashboard;
