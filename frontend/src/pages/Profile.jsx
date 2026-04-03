import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import userService from '../services/userService';
import authService from '../services/authService';
import pointService from '../services/pointService';
import toast from 'react-hot-toast';
import Skeleton from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';
import { 
    Monitor, 
    Smartphone, 
    Laptop, 
    Mail, 
    Phone, 
    Calendar, 
    Shield, 
    Trash2, 
    Edit, 
    LogOut, 
    CheckCircle, 
    AlertCircle, 
    User, 
    Globe,
    Lock,
    Clock,
    UserCircle,
    Bell,
    CheckCircle2,
    Inbox,
    Star,
    Trophy,
    Zap
} from 'lucide-react';
import './Profile.css';

// ── Level order for upgrade detection ────────────────────────────────────────
const LEVEL_ORDER = { Unranked: 0, Bronze: 1, Silver: 2, Gold: 3 };

// ── Confetti pieces (generated once, stable across renders) ──────────────────
const CONFETTI = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.4}s`,
    duration: `${1.8 + Math.random() * 1.4}s`,
    color: ['#6366f1','#a855f7','#f59e0b','#10b981','#ec4899','#38bdf8'][i % 6],
    size: `${6 + Math.random() * 8}px`,
    rotate: `${Math.random() * 360}deg`,
}));

// ── CelebrationModal (defined outside Profile so it never remounts) ───────────
const CelebrationModal = ({ level, onClose }) => {
    if (!level) return null;
    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', padding: '1rem',
                overflow: 'hidden',
            }}
        >
            {/* Confetti */}
            {CONFETTI.map(c => (
                <div key={c.id} style={{
                    position: 'absolute', top: '-20px', left: c.left,
                    width: c.size, height: c.size, borderRadius: '2px',
                    background: c.color, transform: `rotate(${c.rotate})`,
                    animation: `confettiFall ${c.duration} ${c.delay} ease-in forwards`,
                    pointerEvents: 'none',
                }} />
            ))}

            {/* Card */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'linear-gradient(135deg,rgba(30,27,75,0.97),rgba(17,24,39,0.97))',
                    border: '1px solid rgba(99,102,241,0.4)',
                    borderRadius: '24px', padding: '2.5rem 2rem',
                    textAlign: 'center', maxWidth: '420px', width: '100%',
                    boxShadow: '0 0 60px rgba(99,102,241,0.3)',
                    animation: 'popIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards',
                    position: 'relative',
                }}
            >
                <div style={{ fontSize: '5.5rem', lineHeight: 1, marginBottom: '0.6rem', animation: 'bounce 0.8s 0.4s ease infinite alternate' }}>
                    {level.emoji}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.14em', color: '#818cf8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Level Up! 🎉
                </div>
                <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: level.color, margin: '0 0 0.5rem' }}>
                    {level.name}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '1.8rem', lineHeight: 1.6 }}>
                    Congratulations! You've reached <strong style={{ color: 'white' }}>{level.name}</strong> level by attending events consistently. Keep it up!
                </p>
                <button
                    onClick={onClose}
                    style={{
                        background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                        color: 'white', border: 'none', borderRadius: '12px',
                        padding: '13px 32px', fontWeight: 700, fontSize: '1rem',
                        cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                    }}
                >
                    Awesome! 🚀
                </button>
            </div>

            <style>{`
                @keyframes confettiFall {
                    0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
                }
                @keyframes popIn {
                    from { transform: scale(0.6); opacity: 0; }
                    to   { transform: scale(1);   opacity: 1; }
                }
                @keyframes bounce {
                    from { transform: translateY(0); }
                    to   { transform: translateY(-14px); }
                }
            `}</style>
        </div>
    );
};

const Profile = () => {
    const { currentUser, token, logout, systemNotifications, setSystemNotifications, systemUnreadCount, fetchSystemNotifications } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [mfaQrCode, setMfaQrCode] = useState(null);
    const [mfaCode, setMfaCode] = useState('');
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [points, setPoints]             = useState(null);
    const [pointsLoading, setPointsLoading] = useState(false);
    const [celebLevel, setCelebLevel]     = useState(null); // level that triggered the celebration
    const navigate = useNavigate();

    const fetchProfile = async () => {
        try {
            const data = await userService.getProfile(token);
            setProfile(data);
        } catch (err) {
            console.error('Failed to fetch profile', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSessions = async () => {
        try {
            const data = await authService.getSessions(token);
            setSessions(data);
        } catch (err) {
            console.error('Failed to fetch sessions', err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchProfile();
            fetchSessions();
        }
        
        // Handle tab switching from URL
        const params = new URLSearchParams(window.location.search);
        if (params.get('tab') === 'notifications') {
            setActiveTab('notifications');
        }
    }, [token]);

    // Fetch points when tab is activated; detect level-up for celebration
    useEffect(() => {
        if (activeTab !== 'points' || points !== null) return;
        const load = async () => {
            setPointsLoading(true);
            try {
                const res = await pointService.getMyPoints();
                const data = res.data.data;
                setPoints(data);

                // ── Level-up detection ──────────────────────────────────────
                const userId = currentUser?._id || currentUser?.id || 'guest';
                const storageKey = `studentLevel_${userId}`;
                const savedLevel = localStorage.getItem(storageKey) || 'Unranked';
                const newLevel   = data.level.name;

                if (
                    LEVEL_ORDER[newLevel] !== undefined &&
                    LEVEL_ORDER[savedLevel] !== undefined &&
                    LEVEL_ORDER[newLevel] > LEVEL_ORDER[savedLevel] &&
                    newLevel !== 'Unranked'
                ) {
                    setCelebLevel(data.level); // triggers the modal
                }
                // Always persist the latest level
                localStorage.setItem(storageKey, newLevel);
            } catch {
                setPoints({ totalPoints: 0, attendedCount: 0, level: { name: 'Unranked', emoji: '⭐', next: 1, color: '#64748b' }, history: [] });
            } finally {
                setPointsLoading(false);
            }
        };
        load();
    }, [activeTab]);

    const handleRevokeSession = async (sessionId) => {
        try {
            await authService.revokeSession(token, sessionId);
            fetchSessions();
        } catch (err) {
            alert('Failed to revoke session');
        }
    };

    const handleLogoutAll = async () => {
        if (window.confirm('Are you sure you want to log out of all devices?')) {
            try {
                await authService.logoutAllDevices(token);
                logout(); // Log out current device too
                navigate('/login');
            } catch (err) {
                alert('Failed to logout of all devices');
            }
        }
    };

    const handleGenerateMfa = async () => {
        try {
            const data = await authService.generateMfa(token);
            setMfaQrCode(data.qrCodeUrl);
        } catch (err) {
            alert('Failed to generate MFA secret');
        }
    };

    const handleVerifyMfa = async () => {
        try {
            await authService.verifyMfaSetup(token, mfaCode);
            alert('MFA enabled successfully!');
            setMfaQrCode(null);
            setMfaCode('');
            fetchProfile();
        } catch (err) {
            alert(err.response?.data?.message || 'Invalid MFA code');
        }
    };

    const handleDisableMfa = async () => {
        if (window.confirm('Are you sure you want to disable MFA? Your account will be less secure.')) {
            try {
                await authService.disableMfa(token);
                alert('MFA disabled successfully');
                fetchProfile();
            } catch (err) {
                alert('Failed to disable MFA');
            }
        }
    };

    const currentSessionId = (() => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return null;
            const user = JSON.parse(userStr);
            const tokenParts = user?.token?.split('.');
            if (!tokenParts || tokenParts.length < 2) return null;
            const payload = JSON.parse(atob(tokenParts[1]));
            return payload.sessionId;
        } catch (e) {
            return null;
        }
    })();

    const handleMarkAsRead = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSystemNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark read', err);
            toast.error("Failed to mark as read");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/notifications/read-all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                setSystemNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                fetchSystemNotifications();
                toast.success("All marked as read");
            }
        } catch (err) {
            console.error('Failed to mark all read', err);
            toast.error("Failed to clear notifications");
        }
    };

    if (loading) return (
        <div className="profile-container">
            <div className="glass-card" style={{ padding: '40px', marginBottom: '80px', height: '250px' }}>
                <Skeleton variant="circle" width="120px" height="120px" style={{ position: 'absolute', bottom: '-60px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                <div className="glass-card" style={{ padding: '30px' }}>
                    <Skeleton variant="title" width="200px" style={{ marginBottom: '30px' }} />
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} variant="text" width="100%" style={{ height: '50px', marginBottom: '15px' }} />
                    ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-card" style={{ padding: '30px' }}>
                        <Skeleton variant="title" width="150px" />
                        <Skeleton variant="text" width="100%" height="40px" />
                    </div>
                </div>
            </div>
        </div>
    );

    if (!profile) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;

    return (
        <div className="profile-container">
            <header className="profile-hero">
                <div className="profile-avatar-wrapper">
                    <div className="profile-avatar">
                        {profile.profilePicture ? (
                            <img src={profile.profilePicture.startsWith('http') ? profile.profilePicture : `http://localhost:5000${profile.profilePicture}`} alt="Profile" />
                        ) : (
                            profile.name.charAt(0)
                        )}
                    </div>
                </div>
                <div className="profile-header-info">
                    <h1 className="profile-name">{profile.name}</h1>
                    <div className="profile-role-badge">
                        <Shield size={14} />
                        {profile.role} Account
                    </div>
                </div>
                <Link to="/edit-profile" className="btn-primary" style={{ position: 'absolute', right: '40px', bottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Edit size={18} />
                    Edit Profile
                </Link>
            </header>

            <div className="profile-nav-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <User size={18} /> Account Overview
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    <Bell size={18} /> Alerts & Notifications
                    {systemUnreadCount > 0 && <span className="tab-badge">{systemUnreadCount}</span>}
                </button>
                {currentUser?.role === 'student' && (
                    <button
                        className={`tab-btn ${activeTab === 'points' ? 'active' : ''}`}
                        onClick={() => setActiveTab('points')}
                    >
                        <Trophy size={18} /> My Points
                    </button>
                )}
            </div>

            {activeTab === 'overview' ? (
                <div className="profile-main-grid">
                    <div className="info-section">
                        <div className="info-card">
                            <h2 className="card-title">
                                <User size={24} color="var(--primary)" />
                                Personal Information
                            </h2>
                            <div className="info-grid">
                                <div className="info-item">
                                    <div className="info-icon"><Mail size={20} /></div>
                                    <div>
                                        <div className="info-label">Email Address</div>
                                        <div className="info-value">{profile.email}</div>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-icon"><Phone size={20} /></div>
                                    <div>
                                        <div className="info-label">Phone Number</div>
                                        <div className="info-value">{profile.phone || 'Not provided'}</div>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-icon"><Calendar size={20} /></div>
                                    <div>
                                        <div className="info-label">Member Since</div>
                                        <div className="info-value">{new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-icon"><Clock size={20} /></div>
                                    <div>
                                        <div className="info-label">Last Login</div>
                                        <div className="info-value">{profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'First time login'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="security-section">
                        <div className="info-card mfa-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <h2 className="card-title" style={{ marginBottom: 0 }}>
                                    <Lock size={24} color="#10b981" />
                                    Security
                                </h2>
                                <span className={`mfa-status-badge ${profile.isMfaEnabled ? 'mfa-enabled' : 'mfa-disabled'}`}>
                                    {profile.isMfaEnabled ? 'MFA ACTIVE' : 'MFA INACTIVE'}
                                </span>
                            </div>
                            
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                                Multi-Factor Authentication adds an extra layer of protection to your account.
                            </p>

                            {!profile.isMfaEnabled ? (
                                <>
                                    {!mfaQrCode ? (
                                        <button onClick={handleGenerateMfa} className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                            <Shield size={18} />
                                            Enable MFA Protection
                                        </button>
                                    ) : (
                                        <div className="qr-setup-box">
                                            <p style={{ color: '#0f172a', fontWeight: '700', marginBottom: '15px' }}>Scan with Authenticator App</p>
                                            <img src={mfaQrCode} alt="MFA QR Code" style={{ width: '180px', height: '180px', marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                            <input
                                                type="text"
                                                placeholder="6-digit code"
                                                className="input-field"
                                                style={{ color: '#0f172a', border: '2px solid #e2e8f0', background: '#f8fafc', textAlign: 'center', letterSpacing: '8px', fontSize: '1.4rem', fontWeight: 'bold' }}
                                                value={mfaCode}
                                                onChange={(e) => setMfaCode(e.target.value)}
                                                maxLength={6}
                                            />
                                            <button onClick={handleVerifyMfa} className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                                                Verify & Activate
                                            </button>
                                            <button onClick={() => setMfaQrCode(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', marginTop: '15px', cursor: 'pointer' }}>
                                                Cancel Setup
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <button onClick={handleDisableMfa} className="action-btn-v2" style={{ padding: '10px', width: '100%', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                    Disable MFA Protection
                                </button>
                            )}
                        </div>

                        <div className="info-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <h2 className="card-title" style={{ marginBottom: 0 }}>
                                    <Globe size={24} color="var(--primary)" />
                                    Active Sessions
                                </h2>
                                <button onClick={handleLogoutAll} className="action-btn-v2">
                                    Logout All
                                </button>
                            </div>
                            
                            <div className="sessions-list">
                                {sessions.map((session) => (
                                    <div key={session.sessionId} className="session-item-v2">
                                        <div className="session-icon">
                                            {session.os?.toLowerCase().includes('win') || session.os?.toLowerCase().includes('mac') ? <Laptop size={18} /> : 
                                             session.os?.toLowerCase().includes('android') || session.os?.toLowerCase().includes('ios') ? <Smartphone size={18} /> : 
                                             <Monitor size={18} />}
                                        </div>
                                        <div className="session-details">
                                            <div className="session-info">
                                                {session.browser} on {session.os}
                                                {session.sessionId === currentSessionId && (
                                                    <span style={{ fontSize: '0.7rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>Current</span>
                                                )}
                                            </div>
                                            <div className="session-meta">
                                                {session.ip} • {new Date(session.lastActivity).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {session.sessionId !== currentSessionId && (
                                            <button onClick={() => handleRevokeSession(session.sessionId)} className="action-btn-v2" title="Revoke access">
                                                <LogOut size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="info-card" style={{ borderLeft: '4px solid #ef4444', padding: '25px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={18} />
                                Danger Zone
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                                Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                            <button onClick={() => setDeleteModalOpen(true)} className="action-btn-v2" style={{ width: '100%', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px' }}>
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'points' ? (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {pointsLoading ? (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                            <Zap size={32} style={{ color: '#6366f1', marginBottom: '1rem' }} />
                            <p>Loading your achievements…</p>
                        </div>
                    ) : points ? (
                        <>
                            {/* Level hero card */}
                            <div className="glass-card" style={{
                                padding: '2rem', marginBottom: '1.5rem',
                                background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%)',
                                borderLeft: `4px solid ${points.level.color}`,
                                display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap',
                            }}>
                                <div style={{ fontSize: '5rem', lineHeight: 1 }}>{points.level.emoji}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Current Level</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: points.level.color, marginBottom: '4px' }}>{points.level.name}</div>
                                    <div style={{ fontSize: '1rem', color: '#94a3b8' }}>
                                        <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>{points.totalPoints}</span>{' '}
                                        credit points &middot; <span style={{ color: '#818cf8' }}>{points.attendedCount}</span> events attended
                                    </div>
                                    {points.level.next && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>
                                                <span>Progress to next level</span>
                                                <span>{points.attendedCount} / {points.level.next} events</span>
                                            </div>
                                            <div style={{ height: '8px', borderRadius: '99px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%', borderRadius: '99px',
                                                    background: `linear-gradient(90deg, ${points.level.color}, #818cf8)`,
                                                    width: `${Math.min((points.attendedCount / points.level.next) * 100, 100)}%`,
                                                    transition: 'width 0.8s ease',
                                                }} />
                                            </div>
                                        </div>
                                    )}
                                    {!points.level.next && (
                                        <div style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600 }}>🎉 Maximum level reached!</div>
                                    )}
                                </div>
                            </div>

                            {/* Level rules */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                {[
                                    { emoji: '⭐', name: 'Unranked', req: '0 events',   pts: '0 pts',    color: '#64748b' },
                                    { emoji: '🥉', name: 'Bronze',   req: '1+ events',  pts: '10+ pts',  color: '#b45309' },
                                    { emoji: '🥈', name: 'Silver',   req: '5+ events',  pts: '50+ pts',  color: '#94a3b8' },
                                    { emoji: '🥇', name: 'Gold',     req: '10+ events', pts: '100+ pts', color: '#f59e0b' },
                                ].map(lv => (
                                    <div key={lv.name} className="glass-card" style={{
                                        padding: '1rem', borderTop: `3px solid ${lv.color}`, textAlign: 'center',
                                        opacity: points.level.name === lv.name ? 1 : 0.45,
                                        transform: points.level.name === lv.name ? 'scale(1.04)' : 'none',
                                        transition: 'all 0.2s',
                                    }}>
                                        <div style={{ fontSize: '2.2rem' }}>{lv.emoji}</div>
                                        <div style={{ fontWeight: 700, color: lv.color, marginTop: '4px' }}>{lv.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{lv.req}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{lv.pts}</div>
                                    </div>
                                ))}
                            </div>

                            {/* History */}
                            <div className="glass-card" style={{ padding: '1.5rem' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.2rem' }}>
                                    <Star size={18} style={{ color: '#f59e0b' }} /> Attended Events History
                                </h3>
                                {points.history.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#475569' }}>
                                        <Trophy size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                        <p style={{ fontWeight: 600, marginBottom: '4px' }}>No attended events yet</p>
                                        <p style={{ fontSize: '0.85rem' }}>Attend events to start earning credit points!</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {points.history.map((item, idx) => (
                                            <div key={item.bookingId}
                                                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.2s', cursor: 'default' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.07)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                            >
                                                <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color: 'white', flexShrink: 0 }}>
                                                    {idx + 1}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.eventTitle}</div>
                                                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                                                        <Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                                                        {item.eventDate ? new Date(item.eventDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Date N/A'}
                                                        {item.eventLocation && <> &middot; {item.eventLocation}</>}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(99,102,241,0.12)', padding: '5px 12px', borderRadius: '20px', flexShrink: 0 }}>
                                                    <Zap size={13} style={{ color: '#818cf8' }} />
                                                    <span style={{ fontWeight: 700, color: '#818cf8', fontSize: '0.85rem' }}>+{item.pointsEarned} pts</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>
            ) : (
                <div className="notifications-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h2 className="card-title" style={{ marginBottom: 0 }}>
                            <Inbox size={24} color="var(--primary)" />
                            Recent Alerts
                        </h2>
                        {systemUnreadCount > 0 && (
                            <button className="mark-all-read-btn" onClick={handleMarkAllRead}>
                                <CheckCircle2 size={16} /> Mark all as read
                            </button>
                        )}
                    </div>

                    {systemNotifications.length === 0 ? (
                        <div className="notif-empty-state">
                            <div className="notif-empty-icon"><Bell size={64} /></div>
                            <h3>No Notifications Yet</h3>
                            <p>You're all caught up! High-priority alerts will appear here.</p>
                        </div>
                    ) : (
                        systemNotifications.map((notif) => (
                            <div 
                                key={notif._id} 
                                className={`notification-card ${!notif.isRead ? 'unread' : ''}`}
                                onClick={() => {
                                    if (!notif.isRead) handleMarkAsRead(notif._id);
                                    if (notif.link) navigate(notif.link);
                                }}
                            >
                                <div className="notif-icon-wrapper">
                                    <Bell size={24} />
                                </div>
                                <div className="notif-content">
                                    <div className="notif-message">{notif.message}</div>
                                    <div className="notif-time">
                                        <Clock size={14} />
                                        {new Date(notif.createdAt).toLocaleString(undefined, { 
                                            month: 'short', 
                                            day: 'numeric', 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </div>
                                </div>
                                {!notif.isRead && <div style={{ color: 'var(--primary)' }}><CheckCircle2 size={18} /></div>}
                            </div>
                        ))
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModalOpen}
                title="Delete Account"
                message="Are you absolutely sure you want to delete your account? This will permanently remove all your data, including event history and certificates. This action cannot be undone."
                onConfirm={async () => {
                    try {
                        await userService.deleteAccount(token);
                        logout();
                        navigate('/login');
                    } catch (err) {
                        alert(err.response?.data?.message || 'Failed to delete account');
                    }
                }}
                onCancel={() => setDeleteModalOpen(false)}
                confirmText="Delete Permanently"
            />

            {/* ── Level-Up Celebration Modal ── */}
            <CelebrationModal level={celebLevel} onClose={() => setCelebLevel(null)} />
        </div>
    );
};

export default Profile;
