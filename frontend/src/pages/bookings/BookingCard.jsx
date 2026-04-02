import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../services/bookingService';

const statusColors = {
    confirmed: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.25)' },
    attended:  { bg: 'rgba(16,185,129,0.12)',  color: '#34d399', border: 'rgba(16,185,129,0.25)' },
    cancelled: { bg: 'rgba(239,68,68,0.10)',   color: '#f87171', border: 'rgba(239,68,68,0.20)' },
};

const statusIcons = { confirmed: '✅', attended: '🎓', cancelled: '❌' };

const BookingCard = ({ booking, onCancelled, onCertificate }) => {
    const [cancelling, setCancelling] = useState(false);
    const [showCancel, setShowCancel] = useState(false);
    const [reason, setReason] = useState('');
    const [certLoading, setCertLoading] = useState(false);
    const navigate = useNavigate();

    const s = statusColors[booking.status] || statusColors.confirmed;
    const eventDate = new Date(booking.event?.date);
    const isPast = eventDate < new Date();
    const isToday = new Date().toDateString() === eventDate.toDateString();
    const canCancel = booking.status === 'confirmed' && !isPast && !isToday;

    const handleCancel = async () => {
        setCancelling(true);
        try {
            await bookingService.cancelBooking(booking.bookingId, reason);
            onCancelled && onCancelled(booking.bookingId);
            setShowCancel(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel booking');
        } finally {
            setCancelling(false);
        }
    };

    const handleCertificate = async () => {
        setCertLoading(true);
        try {
            const res = await bookingService.generateCertificate(booking.bookingId, false);
            onCertificate && onCertificate(res.data.certificateId);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to generate certificate');
        } finally {
            setCertLoading(false);
        }
    };

    return (
        <div style={{
            background: 'rgba(30,41,59,0.7)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            padding: '1.5rem',
            backdropFilter: 'blur(12px)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            position: 'relative',
            overflow: 'hidden'
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            {/* Left accent bar */}
            <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
                background: s.color, borderRadius: '14px 0 0 14px'
            }} />

            <div style={{ paddingLeft: '0.5rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem', color: '#f1f5f9' }}>
                            {booking.event?.title || 'Event'}
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                            {booking.bookingId}
                        </span>
                    </div>
                    <span style={{
                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600',
                        background: s.bg, color: s.color, border: `1px solid ${s.border}`
                    }}>
                        {statusIcons[booking.status]} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                </div>

                {/* Event details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>Date</div>
                        <div style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
                            📅 {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>Location</div>
                        <div style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>📍 {booking.event?.location || '—'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>Booked</div>
                        <div style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
                            🕒 {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate(`/bookings/${booking.bookingId}`)}
                        style={{
                            padding: '7px 16px', borderRadius: '7px', fontSize: '0.82rem', fontWeight: '600',
                            background: 'rgba(99,102,241,0.12)', color: '#818cf8',
                            border: '1px solid rgba(99,102,241,0.25)', cursor: 'pointer'
                        }}
                    >
                        View Details
                    </button>

                    {canCancel && (
                        <button
                            onClick={() => setShowCancel(true)}
                            style={{
                                padding: '7px 16px', borderRadius: '7px', fontSize: '0.82rem', fontWeight: '600',
                                background: 'rgba(239,68,68,0.08)', color: '#f87171',
                                border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer'
                            }}
                        >
                            Cancel Booking
                        </button>
                    )}

                    {booking.status === 'attended' && !booking.certificateGenerated && (
                        <button
                            onClick={handleCertificate}
                            disabled={certLoading}
                            style={{
                                padding: '7px 16px', borderRadius: '7px', fontSize: '0.82rem', fontWeight: '600',
                                background: 'rgba(16,185,129,0.1)', color: '#34d399',
                                border: '1px solid rgba(16,185,129,0.25)', cursor: 'pointer'
                            }}
                        >
                            {certLoading ? 'Generating...' : '🎓 Get Certificate'}
                        </button>
                    )}

                    {booking.certificateGenerated && booking.certificatePath && (
                        <button
                            onClick={() => navigate(`/bookings/${booking.bookingId}/certificate`)}
                            style={{
                                padding: '7px 16px', borderRadius: '7px', fontSize: '0.82rem', fontWeight: '600',
                                background: 'rgba(16,185,129,0.1)', color: '#34d399',
                                border: '1px solid rgba(16,185,129,0.25)', cursor: 'pointer'
                            }}
                        >
                            📄 Download Certificate
                        </button>
                    )}
                </div>
            </div>

            {/* Cancel modal */}
            {showCancel && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div style={{
                        background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '440px'
                    }}>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Cancel Booking</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                            Are you sure you want to cancel your booking for <strong style={{ color: '#f1f5f9' }}>{booking.event?.title}</strong>?
                        </p>
                        <textarea
                            placeholder="Reason for cancellation (optional)"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            rows={3}
                            style={{
                                width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white', resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: '1.25rem'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem',
                                    background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', cursor: 'pointer'
                                }}
                            >
                                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                            <button
                                onClick={() => { setShowCancel(false); setReason(''); }}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem',
                                    background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                                    border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer'
                                }}
                            >
                                Keep Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingCard;
