import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookingService from "../../services/bookingService";
import BookingCard from '../../components/BookingCard';

const MyBookings = () => {
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
        // Mark certificateGenerated on matched booking
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
        { key: 'all', label: 'All', color: '#6366f1' },
        { key: 'confirmed', label: 'Confirmed', color: '#818cf8' },
        { key: 'attended', label: 'Attended', color: '#34d399' },
        { key: 'cancelled', label: 'Cancelled', color: '#f87171' },
    ];

    if (loading) return (
        <div style={{ padding: '2rem 5%', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            Loading your bookings...
        </div>
    );

    return (
        <div style={{ padding: '2rem 5%', maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                    My <span style={{ color: '#6366f1' }}>Bookings</span>
                </h1>
                <p style={{ color: '#94a3b8' }}>Track all your event reservations in one place.</p>
            </div>

            {/* Stats strip */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))',
                gap: '1rem', marginBottom: '2rem'
            }}>
                {[
                    { label: 'Total', value: counts.all, color: '#6366f1', icon: '📋' },
                    { label: 'Confirmed', value: counts.confirmed, color: '#818cf8', icon: '✅' },
                    { label: 'Attended', value: counts.attended, color: '#34d399', icon: '🎓' },
                    { label: 'Cancelled', value: counts.cancelled, color: '#f87171', icon: '❌' },
                ].map(stat => (
                    <div key={stat.label} className="glass-card" style={{ padding: '1.1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>{stat.icon}</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div style={{
                display: 'flex', gap: '0.5rem', marginBottom: '1.75rem',
                background: 'rgba(255,255,255,0.03)', padding: '6px',
                borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)',
                width: 'fit-content'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        style={{
                            padding: '7px 16px', borderRadius: '7px', fontSize: '0.83rem', fontWeight: '600',
                            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                            background: filter === tab.key ? tab.color : 'transparent',
                            color: filter === tab.key ? 'white' : '#94a3b8'
                        }}
                    >
                        {tab.label} ({counts[tab.key]})
                    </button>
                ))}
            </div>

            {/* Booking cards */}
            {filtered.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '4rem 2rem',
                    background: 'rgba(255,255,255,0.02)', borderRadius: '16px',
                    border: '1px dashed rgba(255,255,255,0.08)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                        {filter === 'all' ? "You haven't booked any events yet." : `No ${filter} bookings.`}
                    </p>
                    {filter === 'all' && (
                        <Link to="/events" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 24px' }}>
                            Explore Events
                        </Link>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
        </div>
    );
};

export default MyBookings;
