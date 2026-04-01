import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import userService from '../services/userService';
import authService from '../services/authService';
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
    Inbox
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { currentUser, token, logout, systemNotifications, setSystemNotifications, systemUnreadCount } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [mfaQrCode, setMfaQrCode] = useState(null);
    const [mfaCode, setMfaCode] = useState('');
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
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
            setSystemNotifications(systemNotifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark read', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const unreadNotifs = systemNotifications.filter(n => !n.isRead);
            await Promise.all(unreadNotifs.map(n => 
                fetch(`http://localhost:5000/api/notifications/${n._id}/read`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ));
            setSystemNotifications(systemNotifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark all read', err);
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
                                onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
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
        </div>
    );
};

export default Profile;
