// frontend/src/pages/StudentDashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import eventService from '../services/eventService';
import Skeleton from '../components/Skeleton';
import EventCountdown from '../components/EventCountdown';
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
    MessageCircleMore,
    HeartHandshake,
    TrendingUp,
    PieChart as PieChartIcon
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const StudentDashboard = () => {
    const { currentUser, refreshProfile, unreadCount } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // States
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await bookingService.getMyBookings();
            setBookings(res.data || []);
        } catch (error) {
            console.error('Error fetching student dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) fetchData();
    }, [currentUser]);

    // Derived stats
    const confirmed = bookings.filter(b => b.status === 'confirmed');
    const attended = bookings.filter(b => b.status === 'attended');
    const certs = attended.filter(b => b.certificateGenerated);
    const upcoming = confirmed.filter(b => b.event && new Date(b.event.date) > new Date());

    const handleDownloadCert = async (b) => {
        try {
            const res = await bookingService.generateCertificate(b.bookingId, false);
            const blob = await bookingService.downloadCertificate(res.data.certificateId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificate_${b.event?.title || 'event'}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert(err.response?.data?.message || 'Certificate download failed. Please ensure the event is completed.');
        }
    };

    const statCards = [
        { title: 'Total Bookings', value: bookings.length, icon: <Calendar size={24} />, color: '#6366f1' },
        { title: 'Upcoming Events', value: upcoming.length, icon: <Star size={24} />, color: '#f59e0b' },
        { title: 'Certificates Earned', value: certs.length, icon: <Award size={24} />, color: '#10b981' },
        { title: 'Chat Notifications', value: unreadCount || 0, icon: <MessageCircle size={24} />, color: '#a855f7' }
    ];

    // Analytics Data 
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    const activityData = [
        { month: 'Jan', events: 0 },
        { month: 'Feb', events: 0 },
        { month: 'Mar', events: Math.max(1, Math.floor(bookings.length / 3)) },
        { month: currentMonth, events: bookings.length }
    ];

    const pieData = [
        { name: 'Workshops', value: 35 },
        { name: 'Networking', value: 25 },
        { name: 'Hackathons', value: upcoming.length > 0 ? 30 : 10 },
        { name: 'Seminars', value: 30 }
    ];
    const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

    if (loading) return (
        <div style={{ padding: '40px 5%' }}>
            <div style={{ marginBottom: '40px' }}>
                <Skeleton variant="title" width="400px" style={{ marginBottom: '10px' }} />
                <Skeleton variant="text" width="60%" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {[1, 2, 3, 4].map(i => <Skeleton key={i} height="120px" variant="rect" style={{ borderRadius: '16px' }} />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                <Skeleton height="400px" variant="rect" style={{ borderRadius: '16px' }} />
                <Skeleton height="400px" variant="rect" style={{ borderRadius: '16px' }} />
            </div>
        </div>
    );

    return (
        <div style={{ padding: '40px 5%', maxWidth: '1600px', margin: '0 auto' }}>
            {/* Header section */}
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
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
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
                style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                    gap: '20px', 
                    marginBottom: '40px' 
                }}
            >
                {statCards.map((stat, idx) => (
                    <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
                        className="glass-card" 
                        style={{ 
                            padding: '24px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '20px',
                            cursor: 'default'
                        }}
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
                    </motion.div>
                ))}
            </motion.div>

            {/* Analytics Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                <section className="glass-card" style={{ padding: '25px', borderLeft: '4px solid #38bdf8' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={20} style={{ color: '#38bdf8' }} /> My Event Activity
                    </h2>
                    <div style={{ width: '100%', height: '240px' }}>
                        <ResponsiveContainer>
                            <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={1}/>
                                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.6}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="events" fill="url(#colorBar)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <section className="glass-card" style={{ padding: '25px', borderLeft: '4px solid #f59e0b' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PieChartIcon size={20} style={{ color: '#f59e0b' }} /> Categories Attended
                    </h2>
                    <div style={{ width: '100%', height: '240px' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                    itemStyle={{ color: 'white' }}
                                />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '0.85rem', color: '#94a3b8' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </section>
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
                        <Link to="/events" style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                            Explore More <ChevronRight size={14} />
                        </Link>
                    </div>

                    {upcoming.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {upcoming.map((b) => (
                                <Link
                                    key={b._id}
                                    to={`/bookings/${b.bookingId}`}
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
                                        <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{b.event?.title}</div>
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
                                            <CheckCircle2 size={10} /> Confirmed
                                        </span>
                                        <EventCountdown targetDate={b.event?.date} compact={true} />
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {b.event?.location}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {new Date(b.event?.date).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '4px' }}>
                                        <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '2px' }}></div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '15px', color: '#64748b' }}><Search size={48} style={{ margin: '0 auto' }} /></div>
                            <h3 style={{ marginBottom: '10px' }}>No upcoming events</h3>
                            <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '0.9rem' }}>You haven't booked any events yet. Discover new opportunities today!</p>
                            <Link to="/events" className="btn-primary" style={{ textDecoration: 'none' }}>Browse Events</Link>
                        </div>
                    )}
                </section>

                {/* Right Column: Certificates & Community */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <section className="glass-card" style={{ padding: '30px', borderTop: '4px solid #10b981' }}>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Award size={24} style={{ color: '#10b981' }} /> My Certificates
                        </h2>
                        {certs.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
                                {certs.map((b, index) => (
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
                                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {b.event?.title}
                                        </div>
                                        <button 
                                            onClick={() => handleDownloadCert(b)}
                                            style={{
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
                                            }}
                                        >
                                            <Download size={14} /> Download
                                        </button>
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
                        <Link to="/chat" className="btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                            Open Chatroom
                        </Link>
                    </section>
                </div>
            </div>

            {/* Volunteering Section */}
            <section className="glass-card" style={{ marginTop: '40px', padding: '40px', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(244, 63, 94, 0.05) 100%)', borderTop: '4px solid #ec4899', overflow: 'hidden', position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <HeartHandshake size={32} style={{ color: '#ec4899' }} /> Make an Impact
                            </h2>
                            <p style={{ color: '#e2e8f0', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6' }}>
                                Join our community of volunteers! Give back, gain new skills, and connect with people who share your passion for making a difference.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            <Link to="/volunteer-register" className="btn-primary" style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)', textDecoration: 'none', padding: '12px 24px', fontSize: '1rem', border: 'none' }}>
                                Register Volunteering
                            </Link>
                            <Link to="/volunteer-hub" className="btn-primary" style={{ background: 'transparent', border: '2px solid #ec4899', color: 'white', textDecoration: 'none', padding: '10px 24px', fontSize: '1rem' }}>
                                Volunteering Dashboard
                            </Link>
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        <div style={{ borderRadius: '16px', overflow: 'hidden', height: '250px', position: 'relative' }}>
                            <img 
                                src="https://images.unsplash.com/photo-1593113565694-c6f8716c0296?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                alt="Volunteering group" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)', display: 'flex', alignItems: 'flex-end', padding: '20px', pointerEvents: 'none' }}>
                                <span style={{ color: 'white', fontWeight: '700', fontSize: '1.2rem' }}>Community Service</span>
                            </div>
                        </div>
                        <div style={{ borderRadius: '16px', overflow: 'hidden', height: '250px', position: 'relative' }}>
                            <img 
                                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                alt="Team support" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)', display: 'flex', alignItems: 'flex-end', padding: '20px', pointerEvents: 'none' }}>
                                <span style={{ color: 'white', fontWeight: '700', fontSize: '1.2rem' }}>Event Support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Floating Chat Button */}
            <Link to="/chat" className="floating-chat-btn" title="Open Chat" style={{ 
                width: '64px', height: '64px',
                animation: 'float 3s ease-in-out infinite' 
            }}>
                <MessageCircleMore size={32} strokeWidth={2.5} />
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
