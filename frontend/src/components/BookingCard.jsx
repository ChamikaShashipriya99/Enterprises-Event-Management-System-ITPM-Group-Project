import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, 
    MapPin, 
    Clock, 
    ExternalLink, 
    XCircle, 
    CheckCircle2, 
    GraduationCap,
    Download,
    AlertCircle,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import bookingService from '../services/bookingService';

const statusColors = {
    confirmed: { 
        bg: 'rgba(99, 102, 241, 0.1)', 
        color: '#818cf8', 
        border: 'rgba(99, 102, 241, 0.2)',
        icon: <CheckCircle2 size={14} />,
        glow: 'rgba(99, 102, 241, 0.2)'
    },
    attended:  { 
        bg: 'rgba(16, 185, 129, 0.1)',  
        color: '#34d399', 
        border: 'rgba(16, 185, 129, 0.2)',
        icon: <GraduationCap size={14} />,
        glow: 'rgba(16, 185, 129, 0.2)'
    },
    cancelled: { 
        bg: 'rgba(244, 63, 94, 0.1)',   
        color: '#fb7185', 
        border: 'rgba(244, 63, 94, 0.2)',
        icon: <XCircle size={14} />,
        glow: 'rgba(244, 63, 94, 0.2)'
    },
};

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
        <div className="glass-card" style={{
            display: 'flex',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            minHeight: '180px',
            flexDirection: window.innerWidth < 768 ? 'column' : 'row'
        }}
            onMouseEnter={e => { 
                e.currentTarget.style.transform = 'translateY(-5px)'; 
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${s.glow}`;
            }}
            onMouseLeave={e => { 
                e.currentTarget.style.transform = 'translateY(0)'; 
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.37)';
            }}
        >
            {/* Left Image Section */}
            <div style={{
                width: window.innerWidth < 768 ? '100%' : '240px',
                height: window.innerWidth < 768 ? '160px' : 'auto',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0
            }}>
                {booking.event?.image ? (
                    <img 
                        src={`http://localhost:5000${booking.event.image}`} 
                        alt={booking.event.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{ 
                        width: '100%', height: '100%', 
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Calendar size={40} style={{ opacity: 0.2 }} />
                    </div>
                )}
                <div style={{ 
                    position: 'absolute', inset: 0, 
                    background: 'linear-gradient(to right, transparent, rgba(15, 23, 42, 0.5))' 
                }} />
                
                {/* Status Badge floating on image */}
                <div style={{
                    position: 'absolute', top: '15px', left: '15px',
                    padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800',
                    background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                    backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                    {s.icon} {booking.status.toUpperCase()}
                </div>
            </div>

            {/* Right Content Section */}
            <div style={{ padding: '1.5rem 2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white', marginBottom: '4px', letterSpacing: '-0.02em' }}>
                            {booking.event?.title || 'Untitled Event'}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                            REF: {booking.bookingId}
                        </div>
                    </div>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                    gap: '20px', 
                    marginBottom: '1.5rem' 
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ color: '#6366f1' }}><Calendar size={18} /></div>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Event Date</div>
                            <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600' }}>
                                {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ color: '#10b981' }}><MapPin size={18} /></div>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Location</div>
                            <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600' }}>{booking.event?.location || '—'}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ color: '#a855f7' }}><Clock size={14} /></div>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Booked On</div>
                            <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600' }}>{new Date(booking.createdAt).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>

                {/* Actions Footer */}
                <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    borderTop: '1px solid rgba(255,255,255,0.05)', 
                    paddingTop: '1.25rem',
                    marginTop: 'auto'
                }}>
                    <button
                        onClick={() => navigate(`/bookings/${booking.bookingId}`)}
                        className="btn-primary"
                        style={{
                            padding: '8px 18px', fontSize: '0.85rem', borderRadius: '10px',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        View Pass <ArrowRight size={16} />
                    </button>

                    {canCancel && (
                        <button
                            onClick={() => setShowCancel(true)}
                            style={{
                                padding: '8px 18px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700',
                                background: 'rgba(244, 63, 94, 0.1)', color: '#fb7185',
                                border: '1px solid rgba(244, 63, 94, 0.2)', cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'; }}
                        >
                            <XCircle size={16} /> Cancel
                        </button>
                    )}

                    {booking.status === 'attended' && !booking.certificateGenerated && (
                        <button
                            onClick={handleCertificate}
                            disabled={certLoading}
                            style={{
                                padding: '8px 18px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700',
                                background: 'rgba(16, 185, 129, 0.1)', color: '#34d399',
                                border: '1px solid rgba(16, 185, 129, 0.2)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            {certLoading ? 'Processing...' : <><GraduationCap size={16} /> Claim Certificate</>}
                        </button>
                    )}

                    {booking.status === 'attended' && booking.certificateGenerated && (
                        <button
                            onClick={() => navigate(`/bookings/${booking.bookingId}/certificate`)}
                            style={{
                                padding: '8px 18px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700',
                                background: 'rgba(16, 185, 129, 0.1)', color: '#34d399',
                                border: '1px solid rgba(16, 185, 129, 0.2)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <Download size={16} /> Download Certificate
                        </button>
                    )}
                </div>
            </div>

            {/* Premium Cancel Modal */}
            {showCancel && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
                    backdropFilter: 'blur(10px)', animation: 'fadeIn 0.3s ease'
                }}>
                    <div className="glass-card" style={{
                        padding: '40px', width: '100%', maxWidth: '480px',
                        position: 'relative', border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ 
                            width: '64px', height: '64px', borderRadius: '20px', 
                            background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '24px'
                        }}>
                            <AlertCircle size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white', marginBottom: '12px' }}>Are you sure?</h3>
                        <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '24px' }}>
                            You are about to cancel your seat for <strong style={{ color: 'white' }}>{booking.event?.title}</strong>. This action cannot be undone on the day of the event.
                        </p>
                        
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Reason for cancellation</label>
                            <textarea
                                placeholder="Tell us why you're cancelling..."
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                rows={3}
                                style={{
                                    width: '100%', padding: '15px', borderRadius: '12px', fontSize: '1rem',
                                    background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white', resize: 'none', outline: 'none', transition: 'border-color 0.3s'
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = '#f43f5e'}
                                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="btn-primary"
                                style={{
                                    flex: 1, background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
                                    padding: '14px', borderRadius: '12px', fontSize: '1rem'
                                }}
                            >
                                {cancelling ? 'Processing...' : 'Yes, Cancel Reservation'}
                            </button>
                            <button
                                onClick={() => { setShowCancel(false); setReason(''); }}
                                style={{
                                    flex: 1, padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '1rem',
                                    background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                                    border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer'
                                }}
                            >
                                No, Keep it
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default BookingCard;