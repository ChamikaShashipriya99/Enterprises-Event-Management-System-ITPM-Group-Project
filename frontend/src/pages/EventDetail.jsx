// frontend/src/pages/EventDetails.jsx
// UPDATED: Adds booking availability check + Book Seat button
// Replaces the old registerForEvent / unregisterFromEvent calls with the booking engine.

import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import bookingService from '../services/bookingService';
import { AuthContext } from '../context/AuthContext';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [availability, setAvailability] = useState(null);
    const [booking, setBooking] = useState(false);
    const [booked, setBooked] = useState(false);
    const [bookingRef, setBookingRef] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventRes, availRes] = await Promise.all([
                    eventService.getEventById(id),
                    bookingService.checkAvailability(id)
                ]);
                setEvent(eventRes.data);
                setAvailability(availRes.data);
            } catch (error) {
                console.error('Error fetching event details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleBook = async () => {
        if (!currentUser) { navigate('/login'); return; }
        if (currentUser.role !== 'student') {
            alert('Only students can book events.');
            return;
        }
        setBooking(true);
        try {
            const res = await bookingService.createBooking(id);
            setBooked(true);
            setBookingRef(res.data.bookingId);
            // Refresh availability
            const availRes = await bookingService.checkAvailability(id);
            setAvailability(availRes.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed');
        } finally {
            setBooking(false);
        }
    };

    if (loading) return (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
            Loading event details...
        </div>
    );

    if (!event) return (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
            Event not found
        </div>
    );

    const eventDate = new Date(event.date);
    const isPast = eventDate < new Date();
    const isToday = new Date().toDateString() === eventDate.toDateString();
    const isFull = availability && availability.availableSeats <= 0;
    const availPct = availability
        ? Math.min((availability.confirmedBookings / availability.totalCapacity) * 100, 100)
        : 0;

    return (
        <div style={{ padding: '2rem 5%', maxWidth: '1000px', margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} style={{
                background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                marginBottom: '2rem', fontSize: '1rem', fontWeight: '600'
            }}>
                ← Back to Events
            </button>

            <div className="glass-card" style={{ padding: '3rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                        <span style={{
                            background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                            padding: '6px 16px', borderRadius: '30px', fontSize: '0.85rem',
                            fontWeight: '700', marginBottom: '1rem', display: 'inline-block'
                        }}>
                            {eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <h1 style={{ fontSize: '2.8rem', fontWeight: '800', lineHeight: '1.1' }}>{event.title}</h1>
                    </div>

                    {/* Book button */}
                    {currentUser?.role === 'student' && !isPast && !isToday && !booked && (
                        <button
                            onClick={handleBook}
                            disabled={booking || isFull}
                            className="btn-primary"
                            style={{
                                padding: '12px 30px', fontSize: '1rem',
                                opacity: isFull ? 0.5 : 1,
                                cursor: isFull ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {booking ? 'Booking...' : isFull ? '🔒 Fully Booked' : '🎟️ Book a Seat'}
                        </button>
                    )}

                    {booked && (
                        <div style={{
                            padding: '12px 20px', borderRadius: '10px',
                            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                            color: '#34d399', fontWeight: '700', fontSize: '0.9rem', textAlign: 'center'
                        }}>
                            ✅ Booked!<br />
                            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8' }}>{bookingRef}</span>
                            <br />
                            <button onClick={() => navigate('/my-bookings')} style={{
                                marginTop: '6px', background: 'none', border: 'none',
                                color: '#6366f1', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600'
                            }}>
                                View My Bookings →
                            </button>
                        </div>
                    )}

                    {isPast && (
                        <span style={{
                            padding: '10px 20px', borderRadius: '10px', fontSize: '0.9rem',
                            background: 'rgba(100,116,139,0.1)', color: '#64748b',
                            border: '1px solid rgba(100,116,139,0.2)'
                        }}>
                            Event has ended
                        </span>
                    )}

                    {isToday && !booked && (
                        <span style={{
                            padding: '10px 20px', borderRadius: '10px', fontSize: '0.9rem',
                            background: 'rgba(245,158,11,0.1)', color: '#fbbf24',
                            border: '1px solid rgba(245,158,11,0.2)'
                        }}>
                            ⚠️ Booking closed today
                        </span>
                    )}
                </div>

                {/* Info grid */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
                    gap: '2rem', padding: '2rem 0',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>LOCATION</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>📍 {event.location}</div>
                    </div>
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>ORGANIZER</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: 'var(--primary)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                            }}>
                                {event.organizer?.name?.charAt(0)}
                            </div>
                            <span style={{ fontSize: '1.05rem', fontWeight: '500' }}>{event.organizer?.name}</span>
                        </div>
                    </div>

                    {/* Live availability */}
                    {availability && (
                        <div>
                            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>AVAILABILITY</div>
                            <div style={{ fontSize: '1.05rem', fontWeight: '500', marginBottom: '8px' }}>
                                👥 {availability.availableSeats} / {availability.totalCapacity} seats left
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px' }}>
                                <div style={{
                                    width: `${availPct}%`, height: '100%', borderRadius: '3px',
                                    background: availPct >= 90
                                        ? 'linear-gradient(90deg,#ef4444,#dc2626)'
                                        : availPct >= 60
                                            ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                                            : 'linear-gradient(90deg,#6366f1,#a855f7)',
                                    transition: 'width 0.5s ease'
                                }} />
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                                {isFull
                                    ? '🔴 Fully booked'
                                    : availability.availableSeats <= 5
                                        ? `🟡 Only ${availability.availableSeats} left!`
                                        : '🟢 Seats available'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Description */}
                <div>
                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>About this event</h3>
                    <p style={{ lineHeight: '1.8', color: '#cbd5e1', fontSize: '1.05rem' }}>{event.description}</p>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
