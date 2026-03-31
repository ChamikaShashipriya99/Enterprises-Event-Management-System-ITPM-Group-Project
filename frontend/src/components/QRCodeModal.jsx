import { useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * QR Code Display Modal
 * Shows QR code for a booking with download and sharing options
 */
const QRCodeModal = ({ booking, isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !booking) return null;

    const handleDownload = () => {
        if (!booking.qrCodeImage) return;

        // Create a link element
        const link = document.createElement('a');
        link.href = booking.qrCodeImage;
        link.download = `QR_${booking.bookingId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyToClipboard = async () => {
        try {
            // Copy booking info
            const text = `Event: ${booking.event?.title}\nBooking ID: ${booking.bookingId}\nStatus: ${booking.status}`;
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9998,
                }}
            />

            {/* Modal */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '2rem',
                    maxWidth: '450px',
                    width: '90%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    zIndex: 9999,
                    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                    }}
                >
                    <h2
                        style={{
                            fontSize: '1.4rem',
                            fontWeight: '700',
                            color: '#f1f5f9',
                        }}
                    >
                        Check-In QR Code
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '6px',
                            width: '32px',
                            height: '32px',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#cbd5e1',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Event Info */}
                <div
                    style={{
                        background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: '10px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                    }}
                >
                    <h3
                        style={{
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: '#818cf8',
                            textTransform: 'uppercase',
                            marginBottom: '0.5rem',
                        }}
                    >
                        Event Details
                    </h3>
                    <p
                        style={{
                            fontSize: '0.95rem',
                            color: '#cbd5e1',
                            marginBottom: '0.3rem',
                        }}
                    >
                        <strong>Event:</strong> {booking.event?.title}
                    </p>
                    <p
                        style={{
                            fontSize: '0.95rem',
                            color: '#cbd5e1',
                            marginBottom: '0.3rem',
                        }}
                    >
                        <strong>Booking ID:</strong>{' '}
                        <code
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '0.85rem',
                            }}
                        >
                            {booking.bookingId}
                        </code>
                    </p>
                    <p
                        style={{
                            fontSize: '0.95rem',
                            color: '#cbd5e1',
                        }}
                    >
                        <strong>Status:</strong>{' '}
                        <span
                            style={{
                                background: 'rgba(16,185,129,0.15)',
                                color: '#34d399',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                            }}
                        >
                            {booking.status.charAt(0).toUpperCase() +
                                booking.status.slice(1)}
                        </span>
                    </p>
                </div>

                {/* QR Code Display */}
                <div
                    style={{
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {booking.qrCodeImage ? (
                        <img
                            src={booking.qrCodeImage}
                            alt="QR Code"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                borderRadius: '8px',
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                color: '#64748b',
                                textAlign: 'center',
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                                🔲
                            </div>
                            <div style={{ fontSize: '0.85rem' }}>
                                QR Code not available
                            </div>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div
                    style={{
                        background: 'rgba(251,146,60,0.08)',
                        border: '1px solid rgba(251,146,60,0.2)',
                        borderRadius: '10px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                    }}
                >
                    <h4
                        style={{
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: '#fb923c',
                            textTransform: 'uppercase',
                            marginBottom: '0.5rem',
                        }}
                    >
                        How to Use
                    </h4>
                    <ul
                        style={{
                            fontSize: '0.85rem',
                            color: '#cbd5e1',
                            paddingLeft: '1.2rem',
                            margin: 0,
                        }}
                    >
                        <li>Download or screenshot this QR code</li>
                        <li>Present it at the event entrance</li>
                        <li>Organizer will scan it for check-in</li>
                        <li>After event, you'll receive a certificate</li>
                    </ul>
                </div>

                {/* Actions */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.8rem',
                    }}
                >
                    <button
                        onClick={handleDownload}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            background: 'rgba(99,102,241,0.2)',
                            color: '#818cf8',
                            border: '1px solid rgba(99,102,241,0.3)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                                'rgba(99,102,241,0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                                'rgba(99,102,241,0.2)';
                        }}
                    >
                        📥 Download QR
                    </button>

                    <button
                        onClick={handleCopyToClipboard}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            background: copied
                                ? 'rgba(34,197,94,0.2)'
                                : 'rgba(100,116,139,0.2)',
                            color: copied ? '#22c55e' : '#cbd5e1',
                            border: copied
                                ? '1px solid rgba(34,197,94,0.3)'
                                : '1px solid rgba(100,116,139,0.3)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (!copied) {
                                e.currentTarget.style.background =
                                    'rgba(100,116,139,0.3)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!copied) {
                                e.currentTarget.style.background =
                                    'rgba(100,116,139,0.2)';
                            }
                        }}
                    >
                        {copied ? '✓ Copied' : '📋 Copy Info'}
                    </button>
                </div>

                <button
                    onClick={onClose}
                    style={{
                        width: '100%',
                        marginTop: '1rem',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#cbd5e1',
                        border: '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }}
                >
                    Close
                </button>
            </div>
        </>,
        document.body
    );
};

export default QRCodeModal;
