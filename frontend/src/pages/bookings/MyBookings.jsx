import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
    Calendar, 
    CheckCircle2, 
    GraduationCap, 
    XCircle, 
    ClipboardList,
    Search,
    ChevronRight,
    Loader2,
    Star
} from 'lucide-react';
import bookingService from "../../services/bookingService";
import BookingCard from '../../components/BookingCard';
import Skeleton from '../../components/Skeleton';

const MyBookings = () => {
    const { currentUser } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await bookingService.getMyBookings();
                setBookings(res.data);
            } catch (err) {
                console.error('Failed to fetch bookings', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const handleCancelled = (bookingId) => {
        setBookings(prev =>
            prev.map(b => b.bookingId === bookingId ? { ...b, status: 'cancelled' } : b)
        );
    };

    const handleCertificate = (certificateId) => {
        setBookings(prev =>
            prev.map(b => b.certificatePath ? b : { ...b, certificateGenerated: true })
        );
    };

    const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

    const counts = {
        all: bookings.length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        attended: bookings.filter(b => b.status === 'attended').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };

    const tabs = [
        { key: 'all', label: 'All', color: '#6366f1', icon: <ClipboardList size={14} /> },
        { key: 'confirmed', label: 'Confirmed', color: '#818cf8', icon: <CheckCircle2 size={14} /> },
        { key: 'attended', label: 'Attended', color: '#10b981', icon: <GraduationCap size={14} /> },
        { key: 'cancelled', label: 'Cancelled', color: '#f43f5e', icon: <XCircle size={14} /> },
    ];

    if (loading) return (
        <div style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
                <Skeleton variant="title" width="400px" style={{ marginBottom: '10px' }} />
                <Skeleton variant="text" width="60%" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {[1, 2, 3, 4].map(i => <Skeleton key={i} height="120px" variant="rect" style={{ borderRadius: '16px' }} />)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[1, 2, 3].map(i => <Skeleton key={i} height="180px" variant="rect" style={{ borderRadius: '16px' }} />)}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header synced with Student Dashboard */}
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '8px' }}>
                        My <span style={{ background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Reservations</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                        Welcome back, <span style={{ color: 'white', fontWeight: '600' }}>{currentUser?.name}</span>. Manage and track your event bookings.
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                        <Calendar size={16} />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </header>

            {/* Stats Grid Dashboard Style */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: '20px', 
                marginBottom: '40px' 
            }}>
                {[
                    { label: 'Total Bookings', value: counts.all, color: '#6366f1', icon: <ClipboardList size={24} /> },
                    { label: 'Confirmed Seats', value: counts.confirmed, color: '#818cf8', icon: <CheckCircle2 size={24} /> },
                    { label: 'Attended Events', value: counts.attended, color: '#10b981', icon: <GraduationCap size={24} /> },
                    { label: 'Cancelled', value: counts.cancelled, color: '#f43f5e', icon: <XCircle size={24} /> },
                ].map((stat, idx) => (
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
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500', marginBottom: '4px' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white' }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Premium Filter Tabs Dashboard Style */}
            <div style={{
                display: 'flex', 
                gap: '8px', 
                marginBottom: '2.5rem',
                background: 'rgba(30, 41, 59, 0.5)', 
                padding: '6px',
                borderRadius: '14px', 
                border: '1px solid rgba(255,255,255,0.05)',
                width: 'fit-content',
                backdropFilter: 'blur(10px)'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        style={{
                            padding: '10px 24px', 
                            borderRadius: '10px', 
                            fontSize: '0.9rem', 
                            fontWeight: '700',
                            border: 'none', 
                            cursor: 'pointer', 
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: filter === tab.key ? tab.color : 'transparent',
                            color: filter === tab.key ? 'white' : '#94a3b8',
                            boxShadow: filter === tab.key ? `0 4px 15px ${tab.color}40` : 'none'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                        <span style={{ 
                            fontSize: '0.75rem', 
                            opacity: '0.8',
                            background: filter === tab.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                            padding: '2px 8px',
                            borderRadius: '5px',
                            marginLeft: '4px'
                        }}>
                            {counts[tab.key]}
                        </span>
                    </button>
                ))}
            </div>

            {/* List of bookings */}
            {filtered.length === 0 ? (
                <div style={{
                    textAlign: 'center', 
                    padding: '80px 40px',
                    background: 'rgba(255,255,255,0.02)', 
                    borderRadius: '24px',
                    border: '1px dashed rgba(255,255,255,0.1)',
                    animation: 'fadeIn 0.5s ease'
                }}>
                    <div style={{ 
                        width: '96px', 
                        height: '96px', 
                        borderRadius: '50%', 
                        background: 'rgba(255,255,255,0.05)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto 2rem' 
                    }}>
                        <Search size={48} style={{ color: '#64748b' }} />
                    </div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
                        {filter === 'all' ? "No reservations yet" : `No ${filter} bookings`}
                    </h3>
                    <p style={{ color: '#94a3b8', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px', lineHeight: '1.6' }}>
                        {filter === 'all' ? "Your schedule looks clear! Why not explore some upcoming events and secure your spot today?" : `You don't have any ${filter} event reservations at the moment.`}
                    </p>
                    {filter === 'all' && (
                        <Link to="/events" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 32px' }}>
                            Discover Events <ChevronRight size={20} />
                        </Link>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {filtered.map(booking => (
                        <BookingCard
                            key={booking._id}
                            booking={booking}
                            onCancelled={handleCancelled}
                            onCertificate={handleCertificate}
                        />
                    ))}
                </div>
            )}
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default MyBookings;
