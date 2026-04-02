// frontend/src/pages/AdminDashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import eventService from '../services/eventService';
import bookingService from '../services/bookingService';
import chatService from '../services/chatService';
import Skeleton from '../components/Skeleton';
import { 
    Users, 
    Calendar, 
    Building2, 
    GraduationCap, 
    Zap, 
    MessageSquare, 
    FileImage, 
    ShieldCheck, 
    Trash2, 
    Megaphone,
    TrendingUp,
    LineChart,
    PieChart as PieChartIcon,
    Clock,
    Sparkles,
    MessageCircleMore
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';

const AdminDashboard = () => {
    const { socket, unreadCount } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalEvents: 0,
        totalOrganizers: 0,
        totalStudents: 0
    });
    
    const [bookingStats, setBookingStats] = useState({ 
        total: 0, 
        attended: 0 
    });
    
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
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;
            
            const [eventRes, bookRes, chatRes] = await Promise.all([
                eventService.getAdminStats(),
                bookingService.getAllBookings(),
                chatService.getChatStats(token)
            ]);
            
            setStats(eventRes.data);
            
            const bookings = bookRes.data || [];
            setBookingStats({
                total: bookings.length,
                attended: bookings.filter(b => b.status === 'attended').length
            });
            
            setChatStats(chatRes);
        } catch (error) {
            console.error('Error fetching admin dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchData(true);
    }, []);

    // Socket real-time updates for chat
    useEffect(() => {
        if (socket) {
            const handleUpdate = () => fetchData(false);
            
            socket.on("message-received", handleUpdate);
            socket.on("message-removed", handleUpdate);
            socket.on("message-updated", handleUpdate);
            socket.on("chat-pinned-updated", handleUpdate);
            socket.on("chat-cleared", handleUpdate);

            return () => {
                socket.off("message-received", handleUpdate);
                socket.off("message-removed", handleUpdate);
                socket.off("message-updated", handleUpdate);
                socket.off("chat-pinned-updated", handleUpdate);
                socket.off("chat-cleared", handleUpdate);
            };
        }
    }, [socket]);

    if (loading) return (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', margin: '2rem 5%' }}>
            <div style={{ marginBottom: '1rem' }}><Clock size={40} className="spin" style={{ color: '#6366f1' }} /></div>
            <h2 style={{ color: '#94a3b8' }}>Synchronizing Dashboard Data...</h2>
        </div>
    );

    const mainStatCards = [
        { title: 'Total Users', value: stats.totalUsers, icon: <Users size={28} />, color: '#6366f1' },
        { title: 'Total Events', value: stats.totalEvents, icon: <Calendar size={28} />, color: '#a855f7' },
        { title: 'Registered Bookings', value: bookingStats.total, icon: <Zap size={28} />, color: '#f59e0b' },
        { title: 'System Organizers', value: stats.totalOrganizers, icon: <Building2 size={28} />, color: '#ec4899' },
        { title: 'Active Students', value: stats.totalStudents, icon: <GraduationCap size={28} />, color: '#10b981' }
    ];

    const pulseCards = [
        { title: 'Active Now', value: chatStats.activeNow, icon: <Zap size={22} />, color: '#f59e0b', desc: 'Online Students' },
        { title: "Today's Volume", value: chatStats.todayMsgs, icon: <MessageSquare size={22} />, color: '#0ea5e9', desc: 'Last 24 hours' },
        { title: 'Media Shared', value: chatStats.mediaShared, icon: <FileImage size={22} />, color: '#10b981', desc: 'Attachments' },
        { title: 'Moderation Status', value: chatStats.moderationActions, icon: <ShieldCheck size={22} />, color: '#ef4444', desc: 'Actions Today' }
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
                {mainStatCards.map((card, index) => (
                    <div key={index} className="glass-card" style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.8rem',
                        transition: 'transform 0.3s ease',
                        cursor: 'default'
                    }}>
                        <div style={{ color: card.color }}>{card.icon}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>{card.title}</div>
                        <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'white' }}>{card.value}</div>
                    </div>
                ))}
            </div>

            {/* Community Pulse Section */}
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
                Student <span style={{ color: '#10b981' }}>Community Pulse</span> <TrendingUp size={24} style={{ color: '#10b981' }} />
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                {pulseCards.map((card, index) => (
                    <div key={index} className="glass-card" style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.3rem',
                        borderLeft: `4px solid ${card.color}`,
                        transition: 'transform 0.3s ease'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: card.color }}>{card.icon}</span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' }}>Real-time</span>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500', marginTop: '0.5rem' }}>{card.title}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{chatStats.activeNow > 0 ? card.value : 0}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{card.desc}</div>
                    </div>
                ))}
            </div>

            {/* Visual Insights Section */}
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: '700', marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                Visual <span style={{ color: '#6366f1' }}>Insights</span> <LineChart size={24} style={{ color: '#6366f1' }} />
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
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip 
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                                    itemStyle={{ color: '#6366f1' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Top Contributors Leaderboard */}
                <div className="glass-card" style={{ padding: '2rem', minHeight: '400px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <TrendingUp size={18} /> Top Contributors
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
                                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Content Breakdown Pie Chart */}
                <div className="glass-card" style={{ padding: '2rem', minHeight: '400px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <PieChartIcon size={18} /> Content Distribution
                    </h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={chatStats.fileBreakdown}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chatStats.fileBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ec4899'][index % 4]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Moderation Insights Section */}
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: '700', marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                Moderation <span style={{ color: '#ec4899' }}>Insights</span> <Sparkles size={24} style={{ color: '#ec4899' }} />
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Self-Deletion Rate</span>
                        <Trash2 size={24} style={{ color: '#ef4444' }} />
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0.5rem 0' }}>{chatStats.insights?.selfDeletionRate || 0}%</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Frequency of student-initiated message removals.
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #a855f7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Announcement Reach</span>
                        <Megaphone size={24} style={{ color: '#a855f7' }} />
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0.5rem 0' }}>{chatStats.insights?.announcementReach || 0}%</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Percentage of students who read the latest admin update.
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: '700', marginTop: '3rem' }}>Management <span style={{ color: '#6366f1' }}>Portal</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users size={20} /> User Management
                    </h3>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>View and manage all registered users in the system.</p>
                    <Link to="/admin/users" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                        Manage Users
                    </Link>
                </div>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar size={20} /> Event Oversight
                    </h3>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Monitor and oversee all events across the platform.</p>
                    <Link to="/admin/events" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
                        Manage Events
                    </Link>
                </div>
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

export default AdminDashboard;
