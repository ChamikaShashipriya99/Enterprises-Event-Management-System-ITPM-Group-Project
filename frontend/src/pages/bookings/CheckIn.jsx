import { useState } from 'react';
import bookingService from "../../services/bookingService";

const CheckIn = () => {
    const [qrInput, setQrInput] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCheckIn = async () => {
        if (!qrInput.trim()) {
            setError('Please enter QR code data.');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);
        try {
            // qrInput can be raw JSON string or the base64/plain text from QR
            const res = await bookingService.checkIn(qrInput.trim());
            setResult(res.data);
            setQrInput('');
        } catch (err) {
            setError(err.response?.data?.message || 'Check-in failed. Invalid or already used QR code.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleCheckIn();
    };

    return (
        <div style={{ padding: '2rem 5%', maxWidth: '700px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                    QR <span style={{ color: '#6366f1' }}>Check-In</span>
                </h1>
                <p style={{ color: '#94a3b8' }}>
                    Scan or paste the attendee's QR code data to mark them as attended.
                </p>
            </div>

            {/* Input card */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#94a3b8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    QR Code Data
                </label>
                <textarea
                    value={qrInput}
                    onChange={e => { setQrInput(e.target.value); setError(''); setResult(null); }}
                    onKeyDown={handleKeyDown}
                    placeholder='Paste QR code data here... e.g. {"bookingId":"BK-XXXX","eventId":"...","studentId":"..."}'
                    rows={4}
                    style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '0.88rem',
                        fontFamily: 'monospace',
                        resize: 'vertical',
                        outline: 'none',
                        boxSizing: 'border-box',
                        marginBottom: '1.25rem',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />

                <button
                    onClick={handleCheckIn}
                    disabled={loading || !qrInput.trim()}
                    className="btn-primary"
                    style={{
                        width: '100%',
                        padding: '14px',
                        fontSize: '1rem',
                        fontWeight: '700',
                        opacity: (!qrInput.trim() || loading) ? 0.6 : 1,
                        cursor: (!qrInput.trim() || loading) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? '⏳ Processing...' : '✅ Mark as Attended'}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.25rem',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    color: '#f87171', fontSize: '0.9rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start'
                }}>
                    <span style={{ fontSize: '1.1rem' }}>❌</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Success */}
            {result && (
                <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: 'rgba(16,185,129,0.15)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem'
                        }}>
                            ✅
                        </div>
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#34d399' }}>Check-In Successful!</div>
                            <div style={{ fontSize: '0.82rem', color: '#64748b', fontFamily: 'monospace' }}>{result.bookingId}</div>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))',
                        gap: '1rem'
                    }}>
                        {[
                            { label: 'Student', value: result.student?.name || '—', icon: '👤' },
                            { label: 'Email', value: result.student?.email || '—', icon: '📧' },
                            { label: 'Event', value: result.event?.title || '—', icon: '📅' },
                            { label: 'Checked In At', value: result.checkedInAt ? new Date(result.checkedInAt).toLocaleString() : '—', icon: '🕒' },
                        ].map(item => (
                            <div key={item.label} style={{
                                padding: '12px 14px', borderRadius: '9px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.07)'
                            }}>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
                                <div style={{ fontSize: '0.88rem', color: '#e2e8f0' }}>{item.icon} {item.value}</div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => { setResult(null); setQrInput(''); }}
                        style={{
                            marginTop: '1.5rem', width: '100%', padding: '11px',
                            borderRadius: '9px', fontWeight: '600', fontSize: '0.9rem',
                            background: 'rgba(99,102,241,0.1)', color: '#818cf8',
                            border: '1px solid rgba(99,102,241,0.25)', cursor: 'pointer'
                        }}
                    >
                        Check In Another Attendee
                    </button>
                </div>
            )}

            {/* Tips */}
            <div style={{
                marginTop: '2rem', padding: '1.25rem 1.5rem', borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)'
            }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700', marginBottom: '0.6rem', textTransform: 'uppercase' }}>
                    💡 Tips
                </div>
                <ul style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.8', paddingLeft: '1.25rem' }}>
                    <li>Use a QR scanner app to scan the attendee's QR code, then paste the result here.</li>
                    <li>QR data is in JSON format — the full string from the booking's <code style={{ color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '1px 5px', borderRadius: '3px' }}>qrCodeData</code> field.</li>
                    <li>Each QR code can only be used once — reuse will be rejected.</li>
                    <li>Only confirmed bookings can be checked in.</li>
                </ul>
            </div>
        </div>
    );
};

export default CheckIn;
