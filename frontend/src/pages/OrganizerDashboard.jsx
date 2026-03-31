import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../services/eventService';
import bookingService from '../services/bookingService';

const OrganizerDashboard = () => {
    const [events, setEvents] = useState([]);
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
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>My Events</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6366f1' }}>{events.length}</div>
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
                </div>
            </div>

            {/* Recent Events */}
            <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem' }}>Recent Events</h3>
                    <Link to="/organizer-events" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '0.9rem' }}>
                        View All
                    </Link>
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

        </div>
    );
};

export default OrganizerDashboard;
