import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bookingService from "../../services/bookingService";

const statusColors = {
    confirmed: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.25)' },
    attended:  { bg: 'rgba(16,185,129,0.12)',  color: '#34d399', border: 'rgba(16,185,129,0.25)' },
    cancelled: { bg: 'rgba(239,68,68,0.10)',   color: '#f87171', border: 'rgba(239,68,68,0.20)' },
};

const BookingDetail = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [showCancel, setShowCancel] = useState(false);
    const [reason, setReason] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await bookingService.getBookingById(bookingId);
                setBooking(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [bookingId]);

    const eventDate = booking ? new Date(booking.event?.date) : null;
    const isPast = eventDate && eventDate < new Date();
    const isToday = eventDate && new Date().toDateString() === eventDate.toDateString();
    const canCancel = booking?.status === 'confirmed' && !isPast && !isToday;

    const handleCancel = async () => {
        setCancelling(true);
        try {
            await bookingService.cancelBooking(bookingId, reason);
            setBooking(prev => ({ ...prev, status: 'cancelled', cancelledAt: new Date(), cancellationReason: reason }));
            setShowCancel(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) return (
        <div style={{ padding: '2rem 5%', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
    );

    if (!booking) return (
        <div style={{ padding: '2rem 5%', textAlign: 'center', color: '#94a3b8' }}>
            Booking not found.
        </div>
    );

    const s = statusColors[booking.status] || statusColors.confirmed;

    return (
        <div style={{ padding: '2rem 5%', maxWidth: '820px', margin: '0 auto' }}>
            {/* Back */}
            <button onClick={() => navigate(-1)} style={{
                background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.95rem', fontWeight: '600', marginBottom: '1.75rem'
            }}>
                ← Back
            </button>

            <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '1.5rem' }}>
                {/* Title row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '0.4rem' }}>
                            {booking.bookingId}
                        </div>
                        <h1 style={{ fontSize: '1.9rem', fontWeight: '800', lineHeight: '1.2' }}>
                            {booking.event?.title}
                        </h1>
                    </div>
                    <span style={{
                        padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700',
                        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                        height: 'fit-content'
                    }}>
                        {booking.status.toUpperCase()}
                    </span>
                </div>

                {/* Event info grid */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
                    gap: '1.5rem', padding: '1.5rem 0',
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    marginBottom: '1.5rem'
                }}>
                    {[
                        { label: 'Event Date', value: eventDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), icon: '📅' },
                        { label: 'Location', value: booking.event?.location, icon: '📍' },
                        { label: 'Booked On', value: new Date(booking.createdAt).toLocaleDateString(), icon: '🕒' },
                        { label: 'Capacity', value: `${booking.event?.capacity} seats`, icon: '👥' },
                    ].map(item => (
                        <div key={item.label}>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
                            <div style={{ fontSize: '0.93rem', color: '#e2e8f0' }}>{item.icon} {item.value}</div>
                        </div>
                    ))}
                </div>

                {/* Check-in info if attended */}
                {booking.status === 'attended' && booking.checkedInAt && (
                    <div style={{
                        padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem',
                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)'
                    }}>
                        <div style={{ color: '#34d399', fontWeight: '700', fontSize: '0.9rem' }}>
                            ✅ Attended — Checked in at {new Date(booking.checkedInAt).toLocaleString()}
                        </div>
                    </div>
                )}

                {/* Cancellation info */}
                {booking.status === 'cancelled' && (
                    <div style={{
                        padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem',
                        background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)'
                    }}>
                        <div style={{ color: '#f87171', fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>
                            ❌ Cancelled on {new Date(booking.cancelledAt).toLocaleDateString()}
                        </div>
                        {booking.cancellationReason && (
                            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Reason: {booking.cancellationReason}</div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {canCancel && (
                        <button onClick={() => setShowCancel(true)} style={{
                            padding: '10px 20px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '600',
                            background: 'rgba(239,68,68,0.08)', color: '#f87171',
                            border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer'
                        }}>
                            Cancel Booking
                        </button>
                    )}

                    
                </div>
            </div>

            {/* QR Code card */}
            {booking.qrCode && booking.status !== 'cancelled' && (
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.4rem' }}>Check-In QR Code</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.87rem', marginBottom: '1.5rem' }}>
                        Present this at the event entrance for contactless check-in.
                    </p>
                    <div style={{
                        display: 'inline-block', padding: '1rem',
                        background: 'white', borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(99,102,241,0.2)'
                    }}>
                        <img src={booking.qrCode} alt="QR Code" style={{ width: '180px', height: '180px', display: 'block' }} />
                    </div>
                    {booking.checkedIn && (
                        <div style={{
                            marginTop: '1rem', padding: '8px 18px', borderRadius: '20px', display: 'inline-block',
                            background: 'rgba(16,185,129,0.12)', color: '#34d399',
                            border: '1px solid rgba(16,185,129,0.25)', fontSize: '0.85rem', fontWeight: '600'
                        }}>
                            ✅ Already checked in
                        </div>
                    )}
                </div>
            )}

            {/* Cancel modal */}
            {showCancel && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div style={{
                        background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '440px'
                    }}>
                        <h3 style={{ marginBottom: '0.75rem' }}>Cancel this booking?</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            This action cannot be undone. Note: cancellations are <strong style={{ color: '#f87171' }}>not allowed on the event day</strong>.
                        </p>
                        <textarea
                            placeholder="Reason (optional)"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            rows={3}
                            style={{
                                width: '100%', padding: '10px 14px', borderRadius: '8px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white', resize: 'none', outline: 'none',
                                boxSizing: 'border-box', marginBottom: '1.25rem', fontSize: '0.9rem'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={handleCancel} disabled={cancelling} style={{
                                flex: 1, padding: '11px', borderRadius: '8px', fontWeight: '600',
                                background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', cursor: 'pointer'
                            }}>
                                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                            </button>
                            <button onClick={() => setShowCancel(false)} style={{
                                flex: 1, padding: '11px', borderRadius: '8px', fontWeight: '600',
                                background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                                border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer'
                            }}>
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingDetail;