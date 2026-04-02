import { useState, useEffect, useRef, useCallback } from 'react';
import bookingService from "../../services/bookingService";
import jsQR from 'jsqr';
import { Camera, Image, ClipboardPaste, CheckCircle2, XCircle, User, Mail, Calendar, Clock, AlertCircle, Lightbulb } from 'lucide-react';

// ── Decode a File into QR data ────────────────────────────────────────────────
// Uses FileReader + HTMLImageElement — works in ALL browsers including Safari.
// Deliberately avoids createImageBitmap which fails in some environments.
const decodeQRFromFile = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('FileReader failed to read the file.'));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('Could not load image — file may be corrupt.'));
            img.onload = () => {
                try {
                    const MAX_SIZE = 800;
                    let width = img.naturalWidth;
                    let height = img.naturalHeight;

                    // Scale down massively high-resolution images to prevent browser freezing
                    if (width > MAX_SIZE || height > MAX_SIZE) {
                        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width  = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const imageData = ctx.getImageData(0, 0, width, height);
                    const qr = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'attemptBoth',
                    });
                    resolve(qr?.data || null);
                } catch (e) {
                    reject(e);
                }
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });

// ── Shared card style ─────────────────────────────────────────────────────────
const CARD = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    padding: '2rem',
};

const LABEL = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '0.6rem',
};

// ─────────────────────────────────────────────────────────────────────────────
const CheckIn = () => {
    const [tab, setTab]     = useState('camera'); // 'camera' | 'upload' | 'paste'
    const [qrInput, setQrInput] = useState('');
    const [result, setResult]   = useState(null);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');

    // camera
    const videoRef  = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const rafRef    = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError,  setCameraError]  = useState('');
    const [scanning,     setScanning]     = useState(false);
    const [scanFlash,    setScanFlash]    = useState(false);

    // upload
    const fileInputRef = useRef(null);
    const [uploadPreview,  setUploadPreview]  = useState(null);
    const [uploadScanning, setUploadScanning] = useState(false);
    const [isDragOver,     setIsDragOver]     = useState(false);

    // ── Submit to API ─────────────────────────────────────────────────────────
    const submitCheckIn = useCallback(async (data) => {
        if (loading) return;
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const res = await bookingService.checkIn(data.trim());
            setResult(res.data);
            setScanFlash(true);
            setTimeout(() => setScanFlash(false), 600);
        } catch (err) {
            setError(err.response?.data?.message || 'Check-in failed. Invalid or already used QR code.');
        } finally {
            setLoading(false);
        }
    }, [loading]);

    // ── Camera helpers ────────────────────────────────────────────────────────
    const startCamera = useCallback(async () => {
        setCameraError('');
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Browser API not supported or secure context required.');
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true // Simple default request, no strict constraints
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                try {
                    await videoRef.current.play();
                } catch (playErr) {
                    console.warn('Video play interrupted usually due to fast re-renders. Ignoring:', playErr.message);
                }
            }
            setCameraActive(true);
            setScanning(true);
        } catch (e) {
            console.error('CheckIn Camera Error:', e);
            setCameraError(
                e.name === 'NotAllowedError'
                    ? 'Camera permission denied. Please allow camera access and try again.'
                    : `Camera error: ${e.message || e.name}. Check console for details.`
            );
        }
    }, []);

    const stopCamera = useCallback(() => {
        cancelAnimationFrame(rafRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
        setScanning(false);
    }, []);

    // ── Camera scan loop ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!cameraActive || !scanning || result) return;
        let stopped = false;
        const tick = async () => {
            if (stopped) return;
            const video  = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas || video.readyState < 2) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }
            canvas.width  = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            try {
                const qr = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
                if (qr?.data) {
                    setScanning(false);
                    await submitCheckIn(qr.data);
                    return;
                }
            } catch { /* ignore per-frame errors */ }
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => { stopped = true; cancelAnimationFrame(rafRef.current); };
    }, [cameraActive, scanning, result, submitCheckIn]);

    // ── Auto-start/stop camera on tab switch ──────────────────────────────────
    useEffect(() => {
        if (tab === 'camera') startCamera();
        else stopCamera();
        setResult(null);
        setError('');
        return () => { if (tab === 'camera') stopCamera(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);

    useEffect(() => () => stopCamera(), [stopCamera]);

    // ── Upload: process a real File object ───────────────────────────────────
    const processUploadFile = useCallback(async (file) => {
        if (!file) return;

        console.log('Upload image selected:', file.name, file.type);
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (PNG, JPG, WEBP, etc.). File selected was: ' + file.type);
            return;
        }

        setError('');
        setResult(null);
        setUploadPreview(URL.createObjectURL(file));
        setUploadScanning(true);

        try {
            // Artificial delay to allow React to render the "Scanning..." state
            // and give the user visual feedback that processing is happening.
            await new Promise(resolve => setTimeout(resolve, 600));

            const qrData = await decodeQRFromFile(file);
            console.log('Decoded QR Data:', qrData);
            
            if (qrData) {
                await submitCheckIn(qrData);
            } else {
                setError('No QR code detected in this image. Try a clearer, well-lit photo with the full QR code visible.');
            }
        } catch (err) {
            console.error('QR upload decode error:', err);
            setError('Could not process this image. Please try a different file or use the Paste tab.');
        } finally {
            setUploadScanning(false);
        }
    }, [submitCheckIn]);

    // Called by the hidden <input type="file">
    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        console.log('File input triggered:', file);
        if (file) {
            processUploadFile(file);
        }
        e.target.value = ''; // clear allowing re-selecting the same file
    };

    // ── Paste submit ──────────────────────────────────────────────────────────
    const handlePasteSubmit = async () => {
        if (!qrInput.trim()) { setError('Please enter QR code data.'); return; }
        await submitCheckIn(qrInput.trim());
        setQrInput('');
    };

    const resetAll = () => {
        setResult(null);
        setError('');
        setQrInput('');
        setUploadPreview(null);
        if (tab === 'camera') setScanning(true);
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{ padding: '2rem 24px', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.3rem' }}>
                    QR <span style={{ color: '#6366f1' }}>Check-In</span>
                </h1>
                <p style={{ color: '#64748b', fontSize: '1rem' }}>
                    Scan with camera, upload a QR image, or paste QR data to mark attendance.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)', gap: '3rem', alignItems: 'start' }}>
                {/* ── Left Column: Scanner ── */}
                <div>
            {/* Tab bar */}
            <div style={{
                display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px', padding: '5px'
            }}>
                {[
                    { id: 'camera', icon: <Camera size={16} />, label: 'Camera' },
                    { id: 'upload', icon: <Image size={16} />, label: 'Upload Image' },
                    { id: 'paste',  icon: <ClipboardPaste size={16} />, label: 'Paste Data' },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        style={{
                            flex: 1, padding: '10px 8px', borderRadius: '8px',
                            border: 'none', cursor: 'pointer', fontWeight: '700',
                            fontSize: '0.85rem', transition: 'all 0.2s',
                            background: tab === t.id ? 'rgba(99,102,241,0.18)' : 'transparent',
                            color: tab === t.id ? '#818cf8' : '#64748b',
                            boxShadow: tab === t.id ? 'inset 0 0 0 1px rgba(99,102,241,0.35)' : 'none',
                        }}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* ── CAMERA TAB ── */}
            {tab === 'camera' && (
                <div style={CARD}>
                    <div style={{
                        position: 'relative', borderRadius: '10px', overflow: 'hidden',
                        background: '#000', aspectRatio: '16/9',
                        border: scanFlash ? '2px solid #34d399' : '2px solid rgba(255,255,255,0.07)',
                        transition: 'border-color 0.15s',
                        boxShadow: scanFlash ? '0 0 24px rgba(52,211,153,0.35)' : 'none',
                    }}>
                        <video
                            ref={videoRef}
                            playsInline muted
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraActive ? 'block' : 'none' }}
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />

                        {cameraActive && !result && (
                            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                                {[
                                    { top: '25%',    left: '30%',  borderTop: '3px solid #6366f1', borderLeft: '3px solid #6366f1' },
                                    { top: '25%',    right: '30%', borderTop: '3px solid #6366f1', borderRight: '3px solid #6366f1' },
                                    { bottom: '25%', left: '30%',  borderBottom: '3px solid #6366f1', borderLeft: '3px solid #6366f1' },
                                    { bottom: '25%', right: '30%', borderBottom: '3px solid #6366f1', borderRight: '3px solid #6366f1' },
                                ].map((s, i) => (
                                    <div key={i} style={{ position: 'absolute', width: '22px', height: '22px', borderRadius: '2px', ...s }} />
                                ))}
                                <div style={{
                                    position: 'absolute', left: '30%', right: '30%', height: '2px',
                                    background: 'linear-gradient(90deg, transparent, #6366f1, transparent)',
                                    animation: 'scanLine 2s ease-in-out infinite',
                                }} />
                            </div>
                        )}

                        {!cameraActive && !cameraError && (
                            <div style={{
                                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#64748b'
                            }}>
                                <Camera size={64} style={{ opacity: 0.5, marginBottom: '10px' }} />
                                <div style={{ fontSize: '0.9rem' }}>Starting camera…</div>
                            </div>
                        )}

                        {cameraActive && (
                            <div style={{
                                position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
                                padding: '5px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                                background: scanning ? 'rgba(99,102,241,0.85)' : 'rgba(52,211,153,0.85)',
                                color: '#fff', backdropFilter: 'blur(4px)',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}>
                                <span style={{
                                    width: '7px', height: '7px', borderRadius: '50%', display: 'inline-block',
                                    background: scanning ? '#a5b4fc' : '#fff',
                                    animation: scanning ? 'pulse 1.2s ease-in-out infinite' : 'none'
                                }} />
                                {scanning ? 'Scanning…' : loading ? 'Processing…' : 'Detected!'}
                            </div>
                        )}
                    </div>

                    {cameraError && (
                        <div style={{
                            marginTop: '1rem', padding: '1rem', borderRadius: '10px',
                            background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                            color: '#f87171', fontSize: '0.88rem'
                        }}>
                            ⚠️ {cameraError}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                        {!cameraActive ? (
                            <button onClick={startCamera} className="btn-primary" style={{ flex: 1, padding: '11px' }}>
                                📷 Start Camera
                            </button>
                        ) : (
                            <>
                                <button onClick={stopCamera} style={{
                                    flex: 1, padding: '11px', borderRadius: '9px', fontWeight: '600',
                                    background: 'rgba(239,68,68,0.08)', color: '#f87171',
                                    border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontSize: '0.9rem'
                                }}>
                                    ⏹ Stop Camera
                                </button>
                                {!scanning && !loading && (
                                    <button onClick={() => { setScanning(true); setResult(null); setError(''); }} className="btn-primary" style={{ flex: 1, padding: '11px' }}>
                                        🔄 Scan Again
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── UPLOAD TAB ── */}
            {tab === 'upload' && (
                <div style={CARD}>
                    {/* Hidden native file picker */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        style={{ display: 'none' }}
                    />

                    {/* Drop zone — passes real File to processUploadFile, no fake events */}
                    <div
                        onClick={() => !uploadScanning && fileInputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={e => {
                            e.preventDefault();
                            setIsDragOver(false);
                            const file = e.dataTransfer.files[0];
                            if (file) processUploadFile(file); // direct File — no synthetic event wrapper
                        }}
                        style={{
                            border: `2px dashed ${isDragOver ? 'rgba(99,102,241,0.7)' : 'rgba(99,102,241,0.35)'}`,
                            borderRadius: '12px',
                            padding: uploadPreview ? '1rem' : '2.5rem 1.5rem',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            gap: '0.75rem',
                            cursor: uploadScanning ? 'wait' : 'pointer',
                            transition: 'all 0.2s',
                            background: isDragOver ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.04)',
                            minHeight: uploadPreview ? 'auto' : '200px',
                        }}
                    >
                        {uploadPreview ? (
                            <img
                                src={uploadPreview}
                                alt="Uploaded QR"
                                style={{ maxHeight: '220px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }}
                            />
                        ) : (
                            <>
                                <div style={{ fontSize: '3rem', pointerEvents: 'none' }}>🖼️</div>
                                <div style={{ fontWeight: '700', color: '#94a3b8', fontSize: '0.95rem', pointerEvents: 'none' }}>
                                    {isDragOver ? 'Drop it here!' : 'Click to upload or drag & drop'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#475569', pointerEvents: 'none' }}>
                                    PNG, JPG, WEBP — screenshot or photo of a QR code
                                </div>
                            </>
                        )}
                    </div>

                    {uploadScanning && (
                        <div style={{ textAlign: 'center', marginTop: '1rem', color: '#818cf8', fontSize: '0.9rem', fontWeight: '600' }}>
                            🔍 Scanning QR code…
                        </div>
                    )}

                    {uploadPreview && !uploadScanning && (
                        <button
                            onClick={() => {
                                setUploadPreview(null);
                                setResult(null);
                                setError('');
                                fileInputRef.current?.click();
                            }}
                            style={{
                                marginTop: '1rem', width: '100%', padding: '11px',
                                borderRadius: '9px', fontWeight: '600', fontSize: '0.9rem',
                                background: 'rgba(99,102,241,0.1)', color: '#818cf8',
                                border: '1px solid rgba(99,102,241,0.25)', cursor: 'pointer'
                            }}
                        >
                            📂 Upload a Different Image
                        </button>
                    )}
                </div>
            )}

            {/* ── PASTE TAB ── */}
            {tab === 'paste' && (
                <div style={CARD}>
                    <label style={LABEL}>QR Code Data</label>
                    <textarea
                        value={qrInput}
                        onChange={e => { setQrInput(e.target.value); setError(''); setResult(null); }}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePasteSubmit(); } }}
                        placeholder='Paste QR code data here… e.g. {"bookingId":"BK-XXXX","eventId":"...","studentId":"..."}'
                        rows={5}
                        style={{
                            width: '100%', padding: '14px 16px', boxSizing: 'border-box',
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px', color: 'white', fontSize: '0.85rem',
                            fontFamily: 'monospace', resize: 'vertical', outline: 'none',
                            marginBottom: '1.25rem', transition: 'border-color 0.2s', lineHeight: '1.6'
                        }}
                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                    <button
                        onClick={handlePasteSubmit}
                        disabled={loading || !qrInput.trim()}
                        className="btn-primary"
                        style={{
                            width: '100%', padding: '14px', fontSize: '1rem', fontWeight: '700',
                            opacity: (!qrInput.trim() || loading) ? 0.5 : 1,
                            cursor: (!qrInput.trim() || loading) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? '⏳ Processing…' : '✅ Mark as Attended'}
                    </button>
                </div>
            )}

            {/* ── Error ── */}
            {error && (
                <div style={{
                    marginTop: '1.25rem', padding: '1rem 1.25rem', borderRadius: '10px',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    color: '#f87171', fontSize: '0.9rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start'
                }}>
                    <XCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{error}</span>
                </div>
            )}

            {/* ── Success ── */}
            {result && (
                <div style={{
                    ...CARD, marginTop: '1.5rem',
                    border: '1px solid rgba(52,211,153,0.3)',
                    boxShadow: '0 0 30px rgba(52,211,153,0.08)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: 'rgba(16,185,129,0.15)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0
                        }}><CheckCircle2 size={24} /></div>
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '1.15rem', color: '#34d399' }}>Check-In Successful!</div>
                            <div style={{ fontSize: '0.78rem', color: '#475569', fontFamily: 'monospace', marginTop: '2px' }}>{result.bookingId}</div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        {[
                            { label: 'Student',       value: result.student?.name  || '—', icon: <User size={14} /> },
                            { label: 'Email',         value: result.student?.email || '—', icon: <Mail size={14} /> },
                            { label: 'Event',         value: result.event?.title   || '—', icon: <Calendar size={14} /> },
                            { label: 'Checked In At', value: result.checkedInAt ? new Date(result.checkedInAt).toLocaleString() : '—', icon: <Clock size={14} /> },
                        ].map(item => (
                            <div key={item.label} style={{
                                padding: '12px 14px', borderRadius: '9px',
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'
                            }}>
                                <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
                                <div style={{ fontSize: '0.85rem', color: '#e2e8f0', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '6px' }}>{item.icon} {item.value}</div>
                            </div>
                        ))}
                    </div>
                    <button onClick={resetAll} style={{
                        width: '100%', padding: '11px', borderRadius: '9px', fontWeight: '600',
                        fontSize: '0.9rem', background: 'rgba(99,102,241,0.1)', color: '#818cf8',
                        border: '1px solid rgba(99,102,241,0.25)', cursor: 'pointer'
                    }}>
                        Check In Another Attendee
                    </button>
                </div>
            )}
            </div> {/* End Left Column */}

            {/* ── Right Column: Tips ── */}
            <div style={{ position: 'sticky', top: '100px' }}>
                    <div style={{
                        padding: '1.5rem 1.75rem', borderRadius: '14px',
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '800', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Lightbulb size={16} style={{ color: '#eab308' }} /> Check-In Instructions
                        </div>
                        <ul style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.85', paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li><strong style={{ color: '#f8fafc' }}>Camera</strong> — hold the QR code steady in front of your webcam inside the bracket guides.</li>
                            <li><strong style={{ color: '#f8fafc' }}>Upload</strong> — use a screenshot or photo of the QR code from the confirmation email.</li>
                            <li><strong style={{ color: '#f8fafc' }}>Paste</strong> — copy the raw <code style={{ color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: '4px' }}>REF</code> number from the booking and paste it here.</li>
                            <li>Each QR code can only be used <strong style={{ color: '#f43f5e' }}>once</strong> — reuse attempts will be rejected.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scanLine {
                    0%   { top: 27%; }
                    50%  { top: 67%; }
                    100% { top: 27%; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%      { opacity: 0.35; }
                }
            `}</style>
        </div>
    );
};

export default CheckIn;
