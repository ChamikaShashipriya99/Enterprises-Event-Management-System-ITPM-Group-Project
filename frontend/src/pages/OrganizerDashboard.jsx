// frontend/src/pages/OrganizerDashboard.jsx
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
    const { currentUser, socket, unreadCount } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [bookingStats, setBookingStats] = useState({});
    
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

    const fetchData = async (showLoading = false) => {
        try {
            if (showLoading) setLoading(true);
            
            // 1. Fetch Events & Chat Stats
            const [eventRes, chatRes] = await Promise.all([
                eventService.getMyEvents(),
                chatService.getChatStats(currentUser?.token)
            ]);
            
            const myEvents = eventRes.data || [];
            setEvents(myEvents);
            setChatStats(chatRes);

            // 2. Fetch Availability for each event
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
            console.error('Error fetching organizer dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        if (currentUser) fetchData(true);
    }, [currentUser]);

    // Socket real-time updates
    useEffect(() => {
        if (socket) {
            const handleUpdate = () => fetchData(false);
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
    }, [socket]);

    // Derived totals
    const totalBooked   = Object.values(bookingStats).reduce((sum, s) => sum + (s.confirmedBookings || 0), 0);
    const totalCapacity = Object.values(bookingStats).reduce((sum, s) => sum + (s.totalCapacity || 0), 0);
    const totalAvail    = Object.values(bookingStats).reduce((sum, s) => sum + (s.availableSeats || 0), 0);

    if (loading) return (
        <div style={{ padding: '2rem 5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Skeleton width="300px" height="40px" />
                <Skeleton width="150px" height="45px" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card" style={{ padding: '1.5rem', height: '110px' }}>
                        <Skeleton width="40%" height="20px" style={{ marginBottom: '8px' }} />
                        <Skeleton width="60%" height="36px" />
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
                    Organizer <span style={{ color: '#a855f7' }}>Dashboard</span>
                </h1>
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

                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #a855f7' }}>
                    <div style={{ color: '#a855f7', marginBottom: '10px' }}><Users size={28} /></div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>Total Bookings</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{totalBooked}</div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
                    <div style={{ color: '#10b981', marginBottom: '10px' }}><Trophy size={28} /></div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>Total Capacity</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{totalCapacity}</div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ color: '#f59e0b' }}><Zap size={28} /></div>
                        <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>LIVE</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '500' }}>Chat Active</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{chatStats.activeNow}</div>
                </div>
            </div>

            {/* Visual Insights Section */}
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
                Community <span style={{ color: '#a855f7' }}>Insights</span> <TrendingUp size={24} style={{ color: '#a855f7' }} />
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
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

                <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '4px solid #ec4899', minHeight: '400px' }}>
                    <h3 style={{ marginBottom: '2rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShieldCheck size={18} /> Moderation Impact
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Self-Deletion Rate</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ef4444' }}>{chatStats.insights?.selfDeletionRate || 0}%</div>
                        </div>
                        <div>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Announcement Reach</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#a855f7' }}>{chatStats.insights?.announcementReach || 0}%</div>
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '2rem', minHeight: '400px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <PieChartIcon size={18} /> Content Distribution
                    </h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={chatStats.fileBreakdown}
                                    innerRadius={50}
                                    outerRadius={75}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chatStats.fileBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#a855f7', '#6366f1', '#10b981', '#f59e0b'][index % 4]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }} />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Events Section */}
            <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <LayoutDashboard size={22} /> Recent Events Overview
                    </h3>
                    <Link to="/organizer-events" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>View All →</Link>
                </div>

                {events.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>No events found. Start by creating your first event!</p>
                        <Link to="/create-event" className="btn-primary" style={{ textDecoration: 'none' }}>Create Event</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {events.slice(0, 4).map(event => {
                            const stat = bookingStats[event._id] || {};
                            const booked   = stat.confirmedBookings ?? 0;
                            const capacity = stat.totalCapacity ?? event.capacity ?? 1;
                            const pct      = Math.min((booked / capacity) * 100, 100);
                            const isPast   = new Date(event.date) < new Date();

                            return (
                                <div key={event._id} style={{
                                    padding: '1.25rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    flexWrap: 'wrap'
                                }}>
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{event.title}</h4>
                                            {isPast && (
                                                <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: '#64748b', fontWeight: 'bold' }}>ENDED</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {new Date(event.date).toLocaleDateString()}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {event.location}</span>
                                        </div>
                                    </div>

                                    <div style={{ minWidth: '180px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: '700' }}>{booked} Booked</span>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{Math.round(pct)}% Capacity</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${pct}%`,
                                                height: '100%',
                                                background: pct >= 90 
                                                    ? 'linear-gradient(90deg, #ec4899, #ef4444)' 
                                                    : 'linear-gradient(90deg, #a855f7, #6366f1)',
                                                transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                            }} />
                                        </div>
                                    </div>
                                    <Link to={`/admin/events/edit/${event._id}`} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Edit</Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Quick Access Portal */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', color: 'white' }}>Announcement Mode</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Notify all students instantly</div>
                    </div>
                    <Link to="/chat" className="btn-primary" style={{ marginLeft: 'auto', padding: '8px 15px', fontSize: '0.8rem', background: '#a855f7' }}>Open</Link>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                        <Zap size={24} />
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', color: 'white' }}>QR Check-In</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Fast track event entry</div>
                    </div>
                    <Link to="/checkin" className="btn-primary" style={{ marginLeft: 'auto', padding: '8px 15px', fontSize: '0.8rem', background: '#10b981' }}>Start</Link>
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
