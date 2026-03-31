import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../services/eventService';
import bookingService from '../services/bookingService';
import Skeleton from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';

const OrganizerEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingStats, setBookingStats] = useState({});
    // bookingStats shape: { [eventId]: { totalCapacity, confirmedBookings, availableSeats } }
    const [modal, setModal] = useState({ isOpen: false, eventId: null });

    const fetchEvents = async () => {
        try {
            const response = await eventService.getMyEvents();
            const myEvents = response.data || [];
            setEvents(myEvents);

            // Fetch live booking counts for every event in parallel
            const statsEntries = await Promise.all(
                myEvents.map(async (event) => {
                    try {
                        const res = await bookingService.checkAvailability(event._id);
                        return [event._id, res.data];
                    } catch {
                        // Fallback so one failure doesn't break the whole page
                        return [event._id, {
                            totalCapacity: event.capacity,
                            confirmedBookings: 0,
                            availableSeats: event.capacity
                        }];
                    }
                })
            );

            setBookingStats(Object.fromEntries(statsEntries));
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = (id) => {
        setModal({ isOpen: true, eventId: id });
    };

    const confirmDelete = async () => {
        try {
            await eventService.deleteEvent(modal.eventId);
            setEvents(events.filter(e => e._id !== modal.eventId));
            // Clean up stats for deleted event
            setBookingStats(prev => {
                const next = { ...prev };
                delete next[modal.eventId];
                return next;
            });
            setModal({ isOpen: false, eventId: null });
        } catch (error) {
            alert('Action failed: Could not delete event');
        }
    };

    if (loading) return (
        <div style={{ padding: '2rem 5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Skeleton variant="title" width="300px" />
                <Skeleton width="120px" height="40px" />
            </div>
            <div className="glass-card" style={{ padding: '0' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                        <Skeleton width="30%" />
                        <Skeleton width="15%" />
                        <Skeleton width="15%" />
                        <Skeleton width="10%" />
                        <Skeleton width="10%" />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '2rem 5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
                    Manage <span style={{ color: '#a855f7' }}>My Events</span>
                </h1>
                <Link to="/create-event" className="btn-primary" style={{ textDecoration: 'none' }}>
                    + New Event
                </Link>
            </div>

            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <th style={{ padding: '20px', color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event Name</th>
                            <th style={{ padding: '20px', color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                            <th style={{ padding: '20px', color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</th>
                            <th style={{ padding: '20px', color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bookings</th>
                            <th style={{ padding: '20px', color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fill Rate</th>
                            <th style={{ padding: '20px', color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                            <th style={{ padding: '20px', color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                    No events organized yet.
                                </td>
                            </tr>
                        ) : (
                            events.map(event => {
                                const stat     = bookingStats[event._id] || {};
                                const booked   = stat.confirmedBookings ?? 0;
                                const capacity = stat.totalCapacity ?? event.capacity ?? 0;
                                const avail    = stat.availableSeats ?? capacity;
                                const pct      = capacity > 0 ? Math.min(Math.round((booked / capacity) * 100), 100) : 0;
                                const isPast   = new Date(event.date) < new Date();
                                const isToday  = new Date().toDateString() === new Date(event.date).toDateString();
                                const isFull   = avail === 0;

                                // Status badge config
                                let statusLabel, statusBg, statusColor;
                                if (isPast) {
                                    statusLabel = 'Ended';
                                    statusBg    = 'rgba(100,116,139,0.12)';
                                    statusColor = '#64748b';
                                } else if (isFull) {
                                    statusLabel = 'Full';
                                    statusBg    = 'rgba(239,68,68,0.1)';
                                    statusColor = '#f87171';
                                } else if (isToday) {
                                    statusLabel = 'Today';
                                    statusBg    = 'rgba(245,158,11,0.1)';
                                    statusColor = '#fbbf24';
                                } else {
                                    statusLabel = 'Open';
                                    statusBg    = 'rgba(16,185,129,0.1)';
                                    statusColor = '#34d399';
                                }

                                // Fill bar colour
                                const barColor = pct >= 90
                                    ? 'linear-gradient(90deg,#ef4444,#dc2626)'
                                    : pct >= 60
                                        ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                                        : 'linear-gradient(90deg,#6366f1,#a855f7)';

                                return (
                                    <tr
                                        key={event._id}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {/* Event name */}
                                        <td style={{ padding: '20px', fontWeight: '700', fontSize: '0.95rem', maxWidth: '220px' }}>
                                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {event.title}
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td style={{ padding: '20px', fontSize: '0.88rem', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>

                                        {/* Location */}
                                        <td style={{ padding: '20px', color: '#94a3b8', fontSize: '0.88rem', maxWidth: '160px' }}>
                                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {event.location}
                                            </div>
                                        </td>

                                        {/* Bookings count */}
                                        <td style={{ padding: '20px' }}>
                                            <span style={{
                                                padding: '5px 12px',
                                                borderRadius: '6px',
                                                background: 'rgba(99,102,241,0.1)',
                                                color: '#818cf8',
                                                fontSize: '0.88rem',
                                                fontWeight: '700',
                                                fontVariantNumeric: 'tabular-nums'
                                            }}>
                                                {booked} / {capacity}
                                            </span>
                                        </td>

                                        {/* Fill rate bar */}
                                        <td style={{ padding: '20px', minWidth: '120px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px' }}>
                                                    <div style={{
                                                        width: `${pct}%`,
                                                        height: '100%',
                                                        borderRadius: '3px',
                                                        background: barColor,
                                                        transition: 'width 0.4s ease'
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', minWidth: '32px' }}>
                                                    {pct}%
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status badge */}
                                        <td style={{ padding: '20px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: '700',
                                                background: statusBg,
                                                color: statusColor
                                            }}>
                                                {statusLabel}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <Link
                                                    to={`/edit-event/${event._id}`}
                                                    style={{
                                                        textDecoration: 'none',
                                                        color: '#6366f1',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        padding: '5px 10px',
                                                        borderRadius: '6px',
                                                        background: 'rgba(99,102,241,0.08)',
                                                        border: '1px solid rgba(99,102,241,0.2)'
                                                    }}
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(event._id)}
                                                    style={{
                                                        background: 'rgba(239,68,68,0.08)',
                                                        border: '1px solid rgba(239,68,68,0.2)',
                                                        color: '#ef4444',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        padding: '5px 10px',
                                                        borderRadius: '6px'
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={modal.isOpen}
                title="Delete Event"
                message="Are you sure you want to securely delete this event? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setModal({ isOpen: false, eventId: null })}
            />
        </div>
    );
};

export default OrganizerEvents;
