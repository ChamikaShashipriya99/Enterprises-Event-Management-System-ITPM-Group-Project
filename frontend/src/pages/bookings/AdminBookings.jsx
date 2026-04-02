import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, CheckCircle2, GraduationCap, XCircle, BarChart3, Check } from 'lucide-react';
import bookingService from "../../services/bookingService";

const statusColors = {
    confirmed: { bg: 'rgba(99,102,241,0.1)', color: '#818cf8', border: 'rgba(99,102,241,0.2)' },
    attended:  { bg: 'rgba(16,185,129,0.1)',  color: '#34d399', border: 'rgba(16,185,129,0.2)' },
    cancelled: { bg: 'rgba(239,68,68,0.08)',  color: '#f87171', border: 'rgba(239,68,68,0.18)' },
};

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [bookRes, statRes] = await Promise.all([
                    bookingService.getAllBookings(),
                    bookingService.getBookingStats()
                ]);
                setBookings(bookRes.data);
                setStats(statRes.data);
            } catch (err) {
                console.error('Failed to fetch admin bookings', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const filtered = bookings.filter(b => {
        const matchStatus = !statusFilter || b.status === statusFilter;
        const matchSearch = !search ||
            b.bookingId?.toLowerCase().includes(search.toLowerCase()) ||
            b.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
            b.event?.title?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const totalConfirmed = bookings.filter(b => b.status === 'confirmed').length;
    const totalAttended = bookings.filter(b => b.status === 'attended').length;
    const totalCancelled = bookings.filter(b => b.status === 'cancelled').length;

    if (loading) return (
        <div style={{ padding: '2rem 5%', textAlign: 'center', color: '#94a3b8' }}>
            Loading booking data...
        </div>
    );

    return (
        <div style={{ padding: '2rem 5%' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                    Booking <span style={{ color: '#6366f1' }}>Management</span>
                </h1>
                <p style={{ color: '#94a3b8' }}>Monitor all reservations across the platform.</p>
            </div>

            {/* Summary stats */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))',
                gap: '1.25rem', marginBottom: '2.5rem'
            }}>
                {[
                    { label: 'Total Bookings', value: bookings.length, icon: <ClipboardList size={28} />, color: '#6366f1' },
                    { label: 'Confirmed', value: totalConfirmed, icon: <CheckCircle2 size={28} />, color: '#818cf8' },
                    { label: 'Attended', value: totalAttended, icon: <GraduationCap size={28} />, color: '#34d399' },
                    { label: 'Cancelled', value: totalCancelled, icon: <XCircle size={28} />, color: '#f87171' },
                ].map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Per-event stats */}
            {stats.length > 0 && (
                <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart3 size={18} /> Bookings by Event
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {stats.map((s, i) => {
                            const pct = s.capacity ? Math.min((s.confirmedBookings / s.capacity) * 100, 100) : 0;
                            return (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                    padding: '10px 14px', borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.03)'
                                }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {s.eventTitle}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {s.confirmedBookings} confirmed · {s.attendedBookings} attended · {s.cancelledBookings} cancelled
                                        </div>
                                    </div>
                                    <div style={{ width: '120px', flexShrink: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Capacity</span>
                                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{s.confirmedBookings}/{s.capacity}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px' }}>
                                            <div style={{
                                                width: `${pct}%`, height: '100%', borderRadius: '3px',
                                                background: pct >= 90 ? 'linear-gradient(90deg,#ef4444,#dc2626)' : 'linear-gradient(90deg,#6366f1,#a855f7)'
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Search by booking ID, student, event..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        flex: '1 1 260px', padding: '10px 16px', borderRadius: '30px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white', outline: 'none', fontSize: '0.88rem'
                    }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <div style={{
                    display: 'flex', gap: '0.5rem',
                    background: 'rgba(255,255,255,0.03)', padding: '5px',
                    borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)'
                }}>
                    {[
                        { key: '', label: 'All' },
                        { key: 'confirmed', label: 'Confirmed' },
                        { key: 'attended', label: 'Attended' },
                        { key: 'cancelled', label: 'Cancelled' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setStatusFilter(tab.key)}
                            style={{
                                padding: '6px 14px', borderRadius: '7px', fontSize: '0.82rem', fontWeight: '600',
                                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                background: statusFilter === tab.key ? '#6366f1' : 'transparent',
                                color: statusFilter === tab.key ? 'white' : '#94a3b8'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                            {['Booking ID', 'Student', 'Event', 'Date', 'Status', 'Certificate', 'Action'].map(h => (
                                <th key={h} style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                    No bookings found.
                                </td>
                            </tr>
                        ) : filtered.map(b => {
                            const s = statusColors[b.status] || statusColors.confirmed;
                            return (
                                <tr
                                    key={b._id}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#94a3b8' }}>
                                        {b.bookingId}
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{b.student?.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.student?.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.9rem', color: '#e2e8f0', maxWidth: '200px' }}>
                                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {b.event?.title}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                                        {new Date(b.event?.date).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600',
                                            background: s.bg, color: s.color, border: `1px solid ${s.border}`
                                        }}>
                                            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem' }}>
                                        {b.certificateGenerated
                                            ? <span style={{ color: '#34d399', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14} /> Issued</span>
                                            : <span style={{ color: '#64748b' }}>—</span>}
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <Link
                                            to={`/bookings/${b.bookingId}`}
                                            style={{
                                                padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600',
                                                background: 'rgba(99,102,241,0.1)', color: '#818cf8',
                                                border: '1px solid rgba(99,102,241,0.2)', textDecoration: 'none'
                                            }}
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: '#64748b', textAlign: 'right' }}>
                Showing {filtered.length} of {bookings.length} bookings
            </div>
        </div>
    );
};

export default AdminBookings;
