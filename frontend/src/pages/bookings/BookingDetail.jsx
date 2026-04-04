import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Clock,
    Users,
    CheckCircle2,
    XCircle,
    GraduationCap,
    Download,
    Mail,
    QrCode,
    AlertCircle,
    Ticket
} from 'lucide-react';
import bookingService from '../../services/bookingService';
import Skeleton from '../../components/Skeleton';

const statusConfig = {
    confirmed: {
        bg: 'rgba(99, 102, 241, 0.1)',
        color: '#818cf8',
        border: 'rgba(99, 102, 241, 0.25)',
        glow: 'rgba(99, 102, 241, 0.15)',
        icon: <CheckCircle2 size={16} />,
        topBorder: '#6366f1'
    },
    attended: {
        bg: 'rgba(16, 185, 129, 0.1)',
        color: '#34d399',
        border: 'rgba(16, 185, 129, 0.25)',
        glow: 'rgba(16, 185, 129, 0.15)',
        icon: <GraduationCap size={16} />,
        topBorder: '#10b981'
    },
    cancelled: {
        bg: 'rgba(244, 63, 94, 0.1)',
        color: '#fb7185',
        border: 'rgba(244, 63, 94, 0.25)',
        glow: 'rgba(244, 63, 94, 0.15)',
        icon: <XCircle size={16} />,
        topBorder: '#f43f5e'
    },
};

// ── Download QR code helper ───────────────────────────────────────────────────
const downloadQRCode = async (booking) => {
    const { qrCode, bookingId, event } = booking;
    if (!qrCode) return;
    const eventTitle = event?.title || 'Event';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
        img.onload  = resolve;
        img.onerror = reject;
        img.src = qrCode;
    });
    const padding = 24, labelH = 52, qrSize = img.width || 280;
    const canvasW = qrSize + padding * 2, canvasH = qrSize + padding * 2 + labelH;
    const canvas = document.createElement('canvas');
    canvas.width = canvasW; canvas.height = canvasH;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, canvasW - 2, canvasH - 2);
    ctx.drawImage(img, padding, padding, qrSize, qrSize);
    ctx.fillStyle = '#1e293b'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
    ctx.fillText(bookingId, canvasW / 2, qrSize + padding + 22);
    ctx.fillStyle = '#64748b'; ctx.font = '11px sans-serif';
    ctx.fillText(eventTitle.length > 40 ? eventTitle.slice(0, 38) + '…' : eventTitle, canvasW / 2, qrSize + padding + 40);
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url; link.download = `QR_${bookingId}.png`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// ─────────────────────────────────────────────────────────────────────────────
const BookingDetail = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking]               = useState(null);
    const [loading, setLoading]               = useState(true);
    const [cancelling, setCancelling]         = useState(false);
    const [showCancel, setShowCancel]         = useState(false);
    const [reason, setReason]                 = useState('');
    const [certLoading, setCertLoading]       = useState(false);
    const [certificateId, setCertificateId]   = useState(null);
    const [certEmailSent, setCertEmailSent]   = useState(false);
    const [qrDownloading, setQrDownloading]   = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await bookingService.getBookingById(bookingId);
                setBooking(res.data);
                if (res.data.certificateId) setCertificateId(res.data.certificateId);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId]);

    const eventDate = booking ? new Date(booking.event?.date) : null;
    const isPast    = eventDate && eventDate < new Date();
    const isToday   = eventDate && new Date().toDateString() === eventDate.toDateString();
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

    const handleGenerateCert = async (withEmail) => {
        setCertLoading(true);
        try {
            const res = await bookingService.generateCertificate(bookingId, withEmail);
            setCertificateId(res.data.certificateId);
            setCertEmailSent(res.data.emailSent || false);
            setBooking(prev => ({ ...prev, certificateGenerated: true }));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to generate certificate');
        } finally {
            setCertLoading(false);
        }
    };

    const handleDownloadCert = async () => {
        if (!certificateId) { alert('No certificate found. Please generate your certificate first.'); return; }
        try {
            const blob = await bookingService.downloadCertificate(certificateId);
            const url  = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            const a    = document.createElement('a');
            a.href = url; a.download = `certificate_${certificateId}.pdf`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Download failed. Please try again.');
        }
    };

    const handleDownloadQR = async () => {
        if (!booking?.qrCode) return;
        setQrDownloading(true);
        try { await downloadQRCode(booking); }
        catch (err) { alert('Could not download QR code. Please try again.'); }
        finally { setQrDownloading(false); }
    };

    if (loading) return (
        <div style={{ padding: '40px 5%', maxWidth: '900px', margin: '0 auto' }}>
            <Skeleton width="120px" height="36px" style={{ borderRadius: '8px', marginBottom: '40px' }} />
            <div style={{ marginBottom: '24px' }}>
                <Skeleton variant="title" width="60%" style={{ marginBottom: '12px' }} />
                <Skeleton variant="text" width="30%" />
            </div>
            <Skeleton height="400px" variant="rect" style={{ borderRadius: '16px', marginBottom: '24px' }} />
            <Skeleton height="250px" variant="rect" style={{ borderRadius: '16px' }} />
        </div>
    );

    if (!booking) return (
        <div style={{ padding: '80px 5%', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Ticket size={40} style={{ color: '#64748b' }} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px' }}>Booking Not Found</h2>
            <p style={{ color: '#94a3b8', marginBottom: '32px' }}>This booking may have been removed or the link is invalid.</p>
            <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
        </div>
    );

    const s      = statusConfig[booking.status] || statusConfig.confirmed;
    const hasCert = booking.certificateGenerated || !!certificateId;

    return (
        <div style={{ padding: '30px 24px', maxWidth: '1300px', margin: '0 auto' }}>

            {/* Back Button — dashboard style */}
            <button onClick={() => navigate(-1)} style={{
                background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '0.95rem', fontWeight: '700', marginBottom: '40px',
                padding: '8px 16px', borderRadius: '10px',
                transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
            >
                <ArrowLeft size={18} /> Back to Bookings
            </button>

            {/* Side-by-side layout: Detail Card + QR Code */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: booking.qrCode && booking.status !== 'cancelled' ? '1fr 320px' : '1fr',
                gap: '24px',
                alignItems: 'start'
            }}>

            {/* Main Detail Card */}
            <div className="glass-card" style={{
                padding: '0',
                marginBottom: '24px',
                overflow: 'hidden',
                borderTop: `4px solid ${s.topBorder}`
            }}>
                {/* Event Image Header */}
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                    {booking.event?.image ? (
                        <img
                            src={`http://localhost:5000${booking.event.image}`}
                            alt={booking.event.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{
                            width: '100%', height: '100%',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Calendar size={64} style={{ opacity: 0.15 }} />
                        </div>
                    )}
                    {/* Dark overlay gradient */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to bottom, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.85) 100%)'
                    }} />
                    {/* Status badge over image */}
                    <div style={{
                        position: 'absolute', bottom: '20px', left: '30px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '800',
                        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                        backdropFilter: 'blur(12px)', boxShadow: `0 4px 20px ${s.glow}`
                    }}>
                        {s.icon} {booking.status.toUpperCase()}
                    </div>
                </div>

                <div style={{ padding: '30px' }}>
                    {/* Title and booking ref */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '30px' }}>
                        <div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                REF: {booking.bookingId}
                            </div>
                            <h1 style={{ fontSize: '2rem', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-0.02em' }}>
                                {booking.event?.title}
                            </h1>
                        </div>
                    </div>

                    {/* Event info grid — dashboard style icon rows */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '24px', padding: '24px 0',
                        borderTop: '1px solid rgba(255,255,255,0.07)',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                        marginBottom: '24px'
                    }}>
                        {[
                            { label: 'Event Date', value: eventDate?.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }), icon: <Calendar size={18} />, color: '#6366f1' },
                            { label: 'Location',   value: booking.event?.location, icon: <MapPin size={18} />, color: '#10b981' },
                            { label: 'Booked On',  value: new Date(booking.createdAt).toLocaleDateString(), icon: <Clock size={18} />, color: '#a855f7' },
                            { label: 'Capacity',   value: `${booking.event?.capacity} seats`, icon: <Users size={18} />, color: '#f59e0b' },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                                    background: `${item.color}15`, color: item.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: `1px solid ${item.color}30`
                                }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{item.label}</div>
                                    <div style={{ fontSize: '0.95rem', color: '#e2e8f0', fontWeight: '600' }}>{item.value || '—'}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Status banners */}
                    {booking.status === 'attended' && booking.checkedInAt && (
                        <div style={{
                            padding: '16px 20px', borderRadius: '12px', marginBottom: '20px',
                            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                            display: 'flex', alignItems: 'center', gap: '12px'
                        }}>
                            <CheckCircle2 size={20} style={{ color: '#34d399', flexShrink: 0 }} />
                            <div style={{ color: '#34d399', fontWeight: '700', fontSize: '0.95rem' }}>
                                Attended — Checked in at {new Date(booking.checkedInAt).toLocaleString()}
                            </div>
                        </div>
                    )}

                    {booking.status === 'cancelled' && (
                        <div style={{
                            padding: '16px 20px', borderRadius: '12px', marginBottom: '20px',
                            background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.18)'
                        }}>
                            <div style={{ color: '#fb7185', fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: booking.cancellationReason ? '6px' : '0' }}>
                                <XCircle size={18} /> Cancelled on {new Date(booking.cancelledAt).toLocaleDateString()}
                            </div>
                            {booking.cancellationReason && (
                                <div style={{ color: '#94a3b8', fontSize: '0.88rem', paddingLeft: '26px' }}>Reason: {booking.cancellationReason}</div>
                            )}
                        </div>
                    )}

                    {certEmailSent && (
                        <div style={{
                            padding: '14px 20px', borderRadius: '12px', marginBottom: '20px',
                            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                            display: 'flex', alignItems: 'center', gap: '10px'
                        }}>
                            <Mail size={18} style={{ color: '#818cf8', flexShrink: 0 }} />
                            <div style={{ color: '#818cf8', fontSize: '0.9rem', fontWeight: '600' }}>
                                Certificate emailed to {booking.student?.email || 'your email'}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {canCancel && (
                            <button onClick={() => setShowCancel(true)} style={{
                                padding: '12px 24px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '700',
                                background: 'rgba(244, 63, 94, 0.1)', color: '#fb7185',
                                border: '1px solid rgba(244, 63, 94, 0.2)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
                            >
                                <XCircle size={16} /> Cancel Booking
                            </button>
                        )}

                        {booking.status === 'attended' && !hasCert && (
                            <>
                                <button
                                    onClick={() => handleGenerateCert(false)}
                                    disabled={certLoading}
                                    style={{
                                        padding: '12px 24px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '700',
                                        background: 'rgba(16,185,129,0.1)', color: '#34d399',
                                        border: '1px solid rgba(16,185,129,0.25)', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        opacity: certLoading ? 0.7 : 1
                                    }}
                                >
                                    <GraduationCap size={16} /> {certLoading ? 'Generating...' : 'Generate Certificate'}
                                </button>
                                <button
                                    onClick={() => handleGenerateCert(true)}
                                    disabled={certLoading}
                                    style={{
                                        padding: '12px 24px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '700',
                                        background: 'rgba(99,102,241,0.1)', color: '#818cf8',
                                        border: '1px solid rgba(99,102,241,0.25)', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        opacity: certLoading ? 0.7 : 1
                                    }}
                                >
                                    <Mail size={16} /> {certLoading ? 'Sending...' : 'Generate & Email'}
                                </button>
                            </>
                        )}

                        {hasCert && (
                            <button onClick={handleDownloadCert} className="btn-primary" style={{
                                padding: '12px 24px', borderRadius: '10px', fontSize: '0.9rem',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                <Download size={16} /> Download Certificate PDF
                            </button>
                        )}

                        {hasCert && !certEmailSent && (
                            <button
                                onClick={() => handleGenerateCert(true)}
                                disabled={certLoading}
                                style={{
                                    padding: '12px 24px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '700',
                                    background: 'rgba(99,102,241,0.08)', color: '#818cf8',
                                    border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    opacity: certLoading ? 0.7 : 1
                                }}
                            >
                                <Mail size={16} /> {certLoading ? 'Sending...' : 'Email Certificate'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* QR Code Card — sticky right column */}
            {booking.qrCode && booking.status !== 'cancelled' && (
                <div className="glass-card" style={{
                    padding: '30px', textAlign: 'center',
                    borderTop: '4px solid #6366f1',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                    position: 'sticky',
                    top: '100px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                        <QrCode size={22} style={{ color: '#6366f1' }} />
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Check-In QR Code</h3>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
                        Present this at the event entrance for contactless check-in.
                    </p>

                    <div style={{
                        display: 'inline-block', padding: '16px',
                        background: 'white', borderRadius: '16px',
                        boxShadow: '0 12px 40px rgba(99,102,241,0.25)',
                        marginBottom: '20px'
                    }}>
                        <img src={booking.qrCode} alt="QR Code" style={{ width: '200px', height: '200px', display: 'block' }} />
                    </div>

                    {booking.checkedIn && (
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            marginBottom: '20px', padding: '8px 20px', borderRadius: '20px',
                            background: 'rgba(16,185,129,0.12)', color: '#34d399',
                            border: '1px solid rgba(16,185,129,0.25)', fontSize: '0.88rem', fontWeight: '700'
                        }}>
                            <CheckCircle2 size={16} /> Already checked in
                        </div>
                    )}

                    <div>
                        <button
                            onClick={handleDownloadQR}
                            disabled={qrDownloading}
                            className="btn-primary"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '10px',
                                padding: '12px 28px', fontSize: '0.9rem', borderRadius: '10px',
                                opacity: qrDownloading ? 0.7 : 1, cursor: qrDownloading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <Download size={18} /> {qrDownloading ? 'Downloading…' : 'Download QR Code'}
                        </button>
                    </div>
                </div>
            )}

            </div>{/* end side-by-side grid */}

            {/* Premium Cancel Modal */}
            {showCancel && createPortal(
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
                    backdropFilter: 'blur(10px)', animation: 'fadeIn 0.3s ease'
                }}>
                    <div className="glass-card" style={{
                        padding: '40px', width: '100%', maxWidth: '480px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '20px',
                            background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '24px'
                        }}>
                            <AlertCircle size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white', marginBottom: '12px' }}>Cancel this booking?</h3>
                        <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px' }}>
                            This action cannot be undone. Cancellations are{' '}
                            <strong style={{ color: '#fb7185' }}>not allowed on the event day</strong>.
                        </p>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Reason for cancellation
                            </label>
                            <textarea
                                placeholder="Tell us why you're cancelling..."
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                rows={3}
                                style={{
                                    width: '100%', padding: '15px', borderRadius: '12px', fontSize: '1rem',
                                    background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white', resize: 'none', outline: 'none', transition: 'border-color 0.3s', boxSizing: 'border-box'
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = '#f43f5e'}
                                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button
                                onClick={handleCancel}
                                disabled={cancelling || !reason.trim()}
                                className="btn-primary"
                                style={{
                                    flex: 1, background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
                                    padding: '14px', borderRadius: '12px', fontSize: '1rem',
                                    opacity: (cancelling || !reason.trim()) ? 0.5 : 1,
                                    cursor: (cancelling || !reason.trim()) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {cancelling ? 'Processing...' : 'Yes, Cancel'}
                            </button>
                            <button
                                onClick={() => { setShowCancel(false); setReason(''); }}
                                style={{
                                    flex: 1, padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '1rem',
                                    background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                                    border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer'
                                }}
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: scale(0.95); }
                            to { opacity: 1; transform: scale(1); }
                        }
                    `}</style>
                </div>,
                document.body
            )}
        </div>
    );
};

export default BookingDetail;
