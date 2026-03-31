import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import jsQR from 'jsqr';

/**
 * QR Code Scanner Component
 * Allows organizers/admins to scan student QR codes for event check-in
 * Uses browser Camera API with jsQR library for QR detection
 */
const QRCodeScanner = ({ eventId }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [scannedResult, setScannedResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [checkInHistory, setCheckInHistory] = useState([]);
    const scanningIntervalRef = useRef(null);
    const lastScannedQRRef = useRef(null);

    // Check-in counter
    const [stats, setStats] = useState({
        totalCheckedIn: 0,
        successful: 0,
        failed: 0,
    });

    /**
     * Start camera and initialize QR scanning
     */
    const startCamera = async () => {
        try {
            setError(null);
            setCameraActive(true); // make sure it's mounted and visible
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: 'environment' } }, // Use back camera on mobile if available
                });
            } catch (err) {
                console.warn('Ideal facing mode failed, trying basic video constraints', err);
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
            }

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute('playsinline', 'true');
                videoRef.current.setAttribute('muted', 'true');
                videoRef.current.setAttribute('autoplay', 'true');
                videoRef.current.play().catch(e => console.warn('Play interrupted', e));
                startScanning();
            }
        } catch (err) {
            let errorMsg = err.message;
            if (err.name === 'NotReadableError' || err.message.includes('Could not start video source')) {
                errorMsg = 'Camera is in use by another application or blocked by the OS.';
            } else if (err.name === 'NotAllowedError') {
                errorMsg = 'Permission completely denied. Please allow camera access in browser settings.';
            }
            setError(`Camera access error: ${errorMsg}`);
            console.error('Camera error:', err);
            setCameraActive(false);
        }
    };

    /**
     * Stop camera and scanning
     */
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
            setCameraActive(false);
        }

        if (scanningIntervalRef.current) {
            clearInterval(scanningIntervalRef.current);
        }

        setScanning(false);
    };

    /**
     * Continuous QR code scanning loop
     */
    const startScanning = () => {
        setScanning(true);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        scanningIntervalRef.current = setInterval(() => {
            if (videoRef.current && canvas && ctx) {
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;

                // Draw video frame to canvas
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                // Use basic edge detection for QR localization
                // (In production, use jsQR library: https://github.com/cozmo/jsQR)
                // For now, we'll use a fallback approach
                scanQRCode(imageData);
            }
        }, 300); // Scan every 300ms
    };

    /**
     * Decode QR code from image data using jsQR
     */
    const scanQRCode = (imageData) => {
        try {
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code && code.data && code.data.trim() !== '') {
                // Check if this is a different QR code than the last one scanned
                if (lastScannedQRRef.current !== code.data) {
                    lastScannedQRRef.current = code.data;
                    handleManualQRInput(code.data);
                }
            }
        } catch (err) {
            // Silently fail - this is expected for frames without QR codes
            console.debug('QR scan error:', err.message);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code && code.data && code.data.trim() !== '') {
                    handleManualQRInput(code.data);
                } else {
                    setError('No valid QR code data found in the image.');
                    setTimeout(() => setError(null), 5000);
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = null; // Reset input
    };

    /**
     * Handle manual QR code input (for testing or fallback)
     */
    const handleManualQRInput = async (qrData) => {
        if (!qrData || typeof qrData !== 'string' || !qrData.trim()) {
            setError('QR code data cannot be empty');
            return;
        }

        await processCheckIn(qrData.trim());
    };

    /**
     * Submit QR code to backend for check-in processing
     */
    const processCheckIn = async (qrData) => {
        setLoading(true);
        setError(null);
        setScannedResult(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `/api/attendance/check-in`,
                { qrCode: qrData, eventId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.success) {
                // Success!
                const attendeeData = response.data.data.attendance;
                setScannedResult(attendeeData);
                setSuccessMessage(
                    `✅ ${attendeeData.studentName} checked in successfully!`
                );

                // Add to history
                setCheckInHistory((prev) => [attendeeData, ...prev.slice(0, 9)]);

                // Update stats
                setStats((prev) => ({
                    ...prev,
                    totalCheckedIn: prev.totalCheckedIn + 1,
                    successful: prev.successful + 1,
                }));

                // Clear success message after 4 seconds
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 4000);
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                err.message ||
                'Check-in failed';
            setError(errorMsg);

            setStats((prev) => ({
                ...prev,
                totalCheckedIn: prev.totalCheckedIn + 1,
                failed: prev.failed + 1,
            }));

            // Clear error after 5 seconds
            setTimeout(() => {
                setError(null);
            }, 5000);
        } finally {
            setLoading(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div
            style={{
                padding: '2rem',
                maxWidth: '600px',
                margin: '0 auto',
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1
                    style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        marginBottom: '0.5rem',
                    }}
                >
                    QR Code <span style={{ color: '#6366f1' }}>Check-In</span>
                </h1>
                <p style={{ color: '#94a3b8' }}>
                    Scan student QR codes to mark attendance at the event
                </p>
            </div>

            {/* Stats */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    marginBottom: '2rem',
                }}
            >
                <div
                    className="glass-card"
                    style={{
                        padding: '1rem',
                        textAlign: 'center',
                        borderRadius: '12px',
                    }}
                >
                    <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>
                        📊
                    </div>
                    <div
                        style={{
                            fontSize: '1.4rem',
                            fontWeight: '800',
                            color: '#6366f1',
                        }}
                    >
                        {stats.totalCheckedIn}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Total Scanned
                    </div>
                </div>

                <div
                    className="glass-card"
                    style={{
                        padding: '1rem',
                        textAlign: 'center',
                        borderRadius: '12px',
                    }}
                >
                    <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>
                        ✅
                    </div>
                    <div
                        style={{
                            fontSize: '1.4rem',
                            fontWeight: '800',
                            color: '#34d399',
                        }}
                    >
                        {stats.successful}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Successful
                    </div>
                </div>

                <div
                    className="glass-card"
                    style={{
                        padding: '1rem',
                        textAlign: 'center',
                        borderRadius: '12px',
                    }}
                >
                    <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>
                        ❌
                    </div>
                    <div
                        style={{
                            fontSize: '1.4rem',
                            fontWeight: '800',
                            color: '#f87171',
                        }}
                    >
                        {stats.failed}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Failed
                    </div>
                </div>
            </div>

            {/* Camera Feed */}
            <div
                style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '2px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '1.5rem',
                }}
            >
                {cameraActive ? (
                    <div
                        style={{
                            position: 'relative',
                            aspectRatio: '4/3',
                            background: '#000',
                        }}
                    >
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                        <canvas
                            ref={canvasRef}
                            style={{
                                display: 'none',
                            }}
                        />

                        {/* Scanning overlay */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '200px',
                                height: '200px',
                                border: '2px solid rgba(99, 102, 241, 0.6)',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            }}
                        />

                        {/* Corner markers */}
                        {[
                            { top: '20%', left: '20%' },
                            { top: '20%', right: '20%' },
                            { bottom: '20%', left: '20%' },
                            { bottom: '20%', right: '20%' },
                        ].map((pos, idx) => (
                            <div
                                key={idx}
                                style={{
                                    position: 'absolute',
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid #6366f1',
                                    borderRadius: '2px',
                                    ...pos,
                                }}
                            />
                        ))}

                        {/* Status text */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '10px',
                                left: '10px',
                                right: '10px',
                                textAlign: 'center',
                                color: '#34d399',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                            }}
                        >
                            {scanning ? '📹 Scanning...' : 'Initializing...'}
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            aspectRatio: '4/3',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            color: '#94a3b8',
                            textAlign: 'center',
                            padding: '2rem',
                        }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                            📷
                        </div>
                        <p style={{ marginBottom: '1rem' }}>
                            Camera not active. Click the button below to start
                            scanning.
                        </p>
                    </div>
                )}
            </div>

            {/* Control Buttons */}
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                }}
            >
                <button
                    onClick={cameraActive ? stopCamera : startCamera}
                    disabled={loading}
                    style={{
                        flex: 1,
                        minWidth: '120px',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        background: cameraActive
                            ? 'rgba(239, 68, 68, 0.2)'
                            : 'rgba(99, 102, 241, 0.2)',
                        color: cameraActive ? '#f87171' : '#818cf8',
                        border: cameraActive
                            ? '1px solid rgba(239, 68, 68, 0.3)'
                            : '1px solid rgba(99, 102, 241, 0.3)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = cameraActive
                            ? 'rgba(239, 68, 68, 0.3)'
                            : 'rgba(99, 102, 241, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = cameraActive
                            ? 'rgba(239, 68, 68, 0.2)'
                            : 'rgba(99, 102, 241, 0.2)';
                    }}
                >
                    {cameraActive ? '⏹ Stop' : '▶ Start Camera'}
                </button>
            </div>

            {/* File Upload Input */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label
                    style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#cbd5e1',
                        marginBottom: '0.5rem',
                    }}
                >
                    Or upload QR image file:
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px dashed rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#cbd5e1',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                    }}
                />
            </div>

            {/* Messages */}
            {successMessage && (
                <div
                    style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        color: '#34d399',
                        fontSize: '0.9rem',
                    }}
                >
                    {successMessage}
                </div>
            )}

            {error && (
                <div
                    style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        color: '#f87171',
                        fontSize: '0.9rem',
                    }}
                >
                    ❌ {error}
                </div>
            )}

            {scannedResult && (
                <div
                    style={{
                        background: 'rgba(99, 102, 241, 0.12)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1rem',
                    }}
                >
                    <h3 style={{ color: '#818cf8', marginBottom: '0.5rem' }}>
                        Latest Check-In
                    </h3>
                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                        <strong>Name:</strong> {scannedResult.studentName}
                        <br />
                        <strong>Email:</strong> {scannedResult.studentEmail}
                        <br />
                        <strong>Event:</strong> {scannedResult.eventTitle}
                        <br />
                        <strong>Time:</strong>{' '}
                        {new Date(scannedResult.checkedInAt).toLocaleTimeString()}
                    </p>
                </div>
            )}

            {/* Check-in History */}
            {checkInHistory.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <h3
                        style={{
                            fontSize: '1rem',
                            fontWeight: '700',
                            marginBottom: '1rem',
                            color: '#f1f5f9',
                        }}
                    >
                        Recent Check-Ins
                    </h3>
                    <div
                        style={{
                            maxHeight: '300px',
                            overflowY: 'auto',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        {checkInHistory.map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '0.75rem',
                                    borderBottom:
                                        idx < checkInHistory.length - 1
                                            ? '1px solid rgba(255, 255, 255, 0.05)'
                                            : 'none',
                                    color: '#cbd5e1',
                                    fontSize: '0.85rem',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div>
                                        <strong>{item.studentName}</strong>{' '}
                                        <span style={{ color: '#64748b' }}>
                                            ({item.studentEmail})
                                        </span>
                                    </div>
                                    <span
                                        style={{
                                            color: '#34d399',
                                            fontSize: '0.75rem',
                                        }}
                                    >
                                        {new Date(
                                            item.checkedInAt
                                        ).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRCodeScanner;
