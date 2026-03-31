/**
 * Enhanced QR Code Scanner Component
 * Professional check-in system UI with:
 * - Visible live camera preview
 * - Centered scanning frame with semi-transparent overlay
 * - Real-time scan status with camera state indicator
 * - Success/error visual feedback
 * - Check-in history panel
 */

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import jsQR from 'jsqr';
import Toast from './Toast';

const QRCodeScannerEnhanced = ({ eventId }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [checkInHistory, setCheckInHistory] = useState([]);
    const [qrDetectedStatus, setQrDetectedStatus] = useState(null);
    const scanningIntervalRef = useRef(null);
    const lastScannedQRRef = useRef(null);
    const [stats, setStats] = useState({
        totalCheckedIn: 0,
        successful: 0,
        failed: 0,
    });

    const startCamera = async () => {
        try {
            setError(null);
            setCameraReady(false);
            
            // First, make the video element visible to prevent stream negotiation errors on some browsers
            setCameraActive(true);
            
            const constraints = {
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };
            
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (err) {
                // Fallback to basic constraints if the advanced ones fail
                console.warn('Advanced constraints failed, trying basic video constraints', err);
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            }

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Ensure video element is properly configured
                videoRef.current.setAttribute('playsinline', 'true');
                videoRef.current.setAttribute('muted', 'true');
                videoRef.current.setAttribute('autoplay', 'true');
                
                // Explicitly play it, ignoring promise to avoid Uncaught Promise warning
                videoRef.current.play().catch(e => console.warn('Play interrupted', e));
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

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
            setCameraActive(false);
            setCameraReady(false);
        }
        if (scanningIntervalRef.current) {
            clearInterval(scanningIntervalRef.current);
        }
        setScanning(false);
        setQrDetectedStatus(null);
    };

    const handleVideoReady = () => {
        setCameraReady(true);
        startScanning();
    };

    const startScanning = () => {
        setScanning(true);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        // Start scanning only after video has metadata
        scanningIntervalRef.current = setInterval(() => {
            if (videoRef.current && canvas && ctx && videoRef.current.videoWidth > 0) {
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                scanQRCode(imageData);
            }
        }, 300);
    };

    const scanQRCode = (imageData) => {
        try {
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code && code.data && code.data.trim() !== '') {
                setQrDetectedStatus('detected');
                setTimeout(() => setQrDetectedStatus(null), 500);
                
                if (lastScannedQRRef.current !== code.data) {
                    lastScannedQRRef.current = code.data;
                    handleManualQRInput(code.data);
                }
            }
        } catch (err) {
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
                    setQrDetectedStatus('detected');
                    setTimeout(() => setQrDetectedStatus(null), 500);
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

    const handleManualQRInput = async (qrData) => {
        if (!qrData || typeof qrData !== 'string' || !qrData.trim()) {
            setError('QR code data cannot be empty');
            return;
        }
        await processCheckIn(qrData.trim());
    };

    const processCheckIn = async (qrData) => {
        setLoading(true);
        setError(null);

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
                const attendeeData = response.data.data.attendance;
                setQrDetectedStatus('success');
                setSuccessMessage(` ✓ ${attendeeData.studentName} checked in!`);
                setCheckInHistory((prev) => [attendeeData, ...prev.slice(0, 9)]);
                setStats((prev) => ({
                    ...prev,
                    totalCheckedIn: prev.totalCheckedIn + 1,
                    successful: prev.successful + 1,
                }));

                // Reset QR ref after successful check-in to allow re-scanning
                setTimeout(() => {
                    lastScannedQRRef.current = null;
                    setQrDetectedStatus(null);
                }, 1500);

                // 🔊 Visual feedback
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (err) {
            console.error('Check-in error:', err);
            setQrDetectedStatus('error');
            const errorMsg = err.response?.data?.message || 'Check-in failed';
            setError(errorMsg);
            setStats((prev) => ({
                ...prev,
                totalCheckedIn: prev.totalCheckedIn + 1,
                failed: prev.failed + 1,
            }));
            setTimeout(() => {
                setQrDetectedStatus(null);
                lastScannedQRRef.current = null;
            }, 1500);
            setTimeout(() => setError(null), 4000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => stopCamera();
    }, []);

    // Get status indicator
    const getStatusIndicator = () => {
        if (!cameraActive) return { text: '📷 Camera Off', color: '#64748b' };
        if (loading) return { text: '⏳ Processing...', color: '#f59e0b' };
        if (qrDetectedStatus === 'success') return { text: '✅ Check-in Success!', color: '#10b981' };
        if (qrDetectedStatus === 'error') return { text: '❌ Invalid QR', color: '#f87171' };
        if (qrDetectedStatus === 'detected') return { text: '🔍 QR Detected!', color: '#06b6d4' };
        if (!cameraReady) return { text: '⏳ Camera Ready...', color: '#818cf8' };
        return { text: '📹 Scanning...', color: '#34d399' };
    };

    const statusIndicator = getStatusIndicator();

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                    Event <span style={{ color: '#6366f1' }}>Check-In</span>
                </h1>
                <p style={{ color: '#94a3b8' }}>Scan student QR codes to mark attendance</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                {/* Main Scanner */}
                <div>
                    {/* Stats Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', color: '#6366f1', fontWeight: '800' }}>{stats.totalCheckedIn}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>Scanned</div>
                        </div>
                        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', color: '#10b981', fontWeight: '800' }}>{stats.successful}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>Success</div>
                        </div>
                        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', color: '#f87171', fontWeight: '800' }}>{stats.failed}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>Failed</div>
                        </div>
                    </div>

                    {/* Scanner Box */}
                    <div style={{
                        position: 'relative',
                        marginBottom: '1.5rem',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '2px solid rgba(99, 102, 241, 0.3)',
                        background: '#000'
                    }}>
                        {cameraActive ? (
                            <div style={{
                                position: 'relative',
                                aspectRatio: '4/3',
                                background: '#000',
                                overflow: 'hidden'
                            }}>
                                {/* Live Video Feed - VISIBLE - MUST BE Z-INDEX 1 */}
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    onLoadedMetadata={handleVideoReady}
                                    onContextMenu={(e) => e.preventDefault()}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block',
                                        zIndex: 1,
                                        backgroundColor: '#000'
                                    }}
                                />
                                <canvas ref={canvasRef} style={{ display: 'none' }} />

                                {/* Semi-transparent Subtle Overlay - Edges only, center is clear */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'radial-gradient(circle at center, transparent 110px, rgba(0,0,0,0.25) 200px)',
                                    pointerEvents: 'none',
                                    zIndex: 2
                                }} />

                                {/* Scanning Frame - Glowing Box */}
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '220px',
                                    height: '220px',
                                    border: '3px solid #10b981',
                                    borderRadius: '12px',
                                    boxShadow: qrDetectedStatus === 'detected' 
                                        ? '0 0 40px rgba(16, 185, 129, 0.9), inset 0 0 20px rgba(16, 185, 129, 0.4)'
                                        : '0 0 30px rgba(16, 185, 129, 0.5)',
                                    pointerEvents: 'none',
                                    zIndex: 10,
                                    transition: 'all 0.3s ease'
                                }} />

                                {/* Corner Markers */}
                                {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) => (
                                    <div key={i} style={{
                                        position: 'absolute',
                                        [x ? 'right' : 'left']: 'calc(50% - 110px)',
                                        [y ? 'bottom' : 'top']: 'calc(50% - 110px)',
                                        width: '30px',
                                        height: '30px',
                                        border: `3px solid #10b981`,
                                        borderRight: x ? 'none' : '3px solid #10b981',
                                        borderBottom: y ? 'none' : '3px solid #10b981',
                                        pointerEvents: 'none',
                                        zIndex: 11
                                    }} />
                                ))}

                                {/* Scan Line Animation */}
                                <div className="scan-box-container" style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '220px',
                                    height: '220px',
                                    pointerEvents: 'none',
                                    zIndex: 10
                                }}>
                                    <div className="scan-line" />
                                </div>

                                {/* Top Center - Instruction Text */}
                                <div style={{
                                    position: 'absolute',
                                    top: '20px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    color: '#10b981',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                                    zIndex: 20,
                                    textAlign: 'center'
                                }}>
                                    Point QR code inside frame
                                </div>

                                {/* Center Status Indicator */}
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, calc(-50% + 130px))',
                                    color: statusIndicator.color,
                                    fontSize: '0.95rem',
                                    fontWeight: '700',
                                    textShadow: '0 2px 12px rgba(0,0,0,0.95)',
                                    zIndex: 20,
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {statusIndicator.text}
                                </div>

                                {/* Bottom Center - Additional Info */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '15px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    color: '#cbd5e1',
                                    fontSize: '0.75rem',
                                    textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                                    zIndex: 20,
                                    textAlign: 'center'
                                }}>
                                    {cameraReady ? '✓ Camera Ready' : '⏳ Initializing camera...'}
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                aspectRatio: '4/3',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#94a3b8',
                                textAlign: 'center',
                                padding: '2rem'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                                <p>Click "Start Camera" to begin scanning</p>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <button
                            onClick={cameraActive ? stopCamera : startCamera}
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                border: 'none',
                                cursor: 'pointer',
                                background: cameraActive
                                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                    : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                color: 'white',
                                transition: 'transform 0.2s'
                            }}
                        >
                            {cameraActive ? '⏹ Stop Camera' : '▶ Start Camera'}
                        </button>
                    </div>

                    {/* File Upload Input */}
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: '#cbd5e1',
                            marginBottom: '0.5rem'
                        }}>
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
                                border: '1px dashed rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#cbd5e1',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        />
                    </div>

                    {/* Messages */}
                    {error && <Toast type="error" message={error} onClose={() => setError(null)} />}
                    {successMessage && <Toast type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}
                </div>

                {/* Sidebar - Check-in History */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div className="glass-card" style={{ padding: '1rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem' }}>
                            Recent Check-Ins
                        </h3>
                        {checkInHistory.length === 0 ? (
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>
                                No check-ins yet
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '600px', overflowY: 'auto' }}>
                                {checkInHistory.map((item, idx) => (
                                    <div key={idx} style={{
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '6px',
                                        borderLeft: '3px solid #10b981',
                                        fontSize: '0.8rem'
                                    }}>
                                        <div style={{ fontWeight: '600', color: '#cbd5e1' }}>{item.studentName}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '2px' }}>
                                            {new Date(item.checkedInAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRCodeScannerEnhanced;
