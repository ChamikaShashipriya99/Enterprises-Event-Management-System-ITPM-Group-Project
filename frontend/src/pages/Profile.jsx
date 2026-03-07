import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import userService from '../services/userService';
import authService from '../services/authService';

const Profile = () => {
    const { currentUser, token, logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [mfaQrCode, setMfaQrCode] = useState(null);
    const [mfaCode, setMfaCode] = useState('');
    const navigate = useNavigate();

    const fetchProfile = async () => {
        try {
            const data = await userService.getProfile(token);
            setProfile(data);
        } catch (err) {
            console.error('Failed to fetch profile', err);
        }
    };

    useEffect(() => {
        if (token) fetchProfile();
    }, [token]);

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

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
            try {
                await userService.deleteAccount(token);
                logout();
                navigate('/login');
            } catch (err) {
                alert('Failed to delete account');
            }
        }
    };

    if (!profile) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;

    return (
        <div style={{ padding: '40px 5%', display: 'flex', justifyContent: 'center' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '700px', padding: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px' }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '3rem',
                        color: 'white'
                    }}>
                        {profile.profilePicture ? (
                            <img src={profile.profilePicture.startsWith('http') ? profile.profilePicture : `http://localhost:5000${profile.profilePicture}`} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            profile.name.charAt(0)
                        )}
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '5px' }}>{profile.name}</h1>
                        <p style={{ color: '#94a3b8', textTransform: 'capitalize' }}>{profile.role} Account</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '5px' }}>Email Address</div>
                        <div style={{ fontSize: '1.1rem' }}>{profile.email}</div>
                    </div>
                    <div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '5px' }}>Phone Number</div>
                        <div style={{ fontSize: '1.1rem' }}>{profile.phone || 'Not provided'}</div>
                    </div>
                    <div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '5px' }}>Member Since</div>
                        <div style={{ fontSize: '1.1rem' }}>{new Date(profile.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '5px' }}>Last Login</div>
                        <div style={{ fontSize: '1.1rem' }}>{profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'First time login'}</div>
                    </div>
                </div>

                <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>Multi-Factor Authentication (MFA)</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Add an extra layer of security to your account.</p>
                        </div>
                        <div style={{
                            padding: '5px 15px',
                            borderRadius: '20px',
                            background: profile.isMfaEnabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: profile.isMfaEnabled ? '#10b981' : '#ef4444',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                        }}>
                            {profile.isMfaEnabled ? 'Enabled' : 'Disabled'}
                        </div>
                    </div>

                    {!profile.isMfaEnabled ? (
                        <>
                            {!mfaQrCode ? (
                                <button onClick={handleGenerateMfa} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                                    Setup MFA
                                </button>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', background: 'white', borderRadius: '10px', marginTop: '20px' }}>
                                    <p style={{ color: '#0f172a', fontWeight: '600', marginBottom: '15px' }}>Scan this QR code with your Authenticator app</p>
                                    <img src={mfaQrCode} alt="MFA QR Code" style={{ width: '200px', height: '200px', marginBottom: '15px' }} />
                                    <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                                        <input
                                            type="text"
                                            placeholder="Enter 6-digit code"
                                            className="input-field"
                                            style={{ color: '#0f172a', border: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'center', letterSpacing: '5px', fontSize: '1.2rem' }}
                                            value={mfaCode}
                                            onChange={(e) => setMfaCode(e.target.value)}
                                            maxLength={6}
                                        />
                                        <button onClick={handleVerifyMfa} className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                                            Verify & Enable
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <button
                            onClick={handleDisableMfa}
                            style={{
                                padding: '10px 20px',
                                background: 'transparent',
                                color: '#ef4444',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                            }}
                        >
                            Disable MFA
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <Link to="/edit-profile" className="btn-primary" style={{ padding: '12px 30px' }}>
                        Edit Profile
                    </Link>
                    <button
                        onClick={handleDeleteAccount}
                        style={{
                            padding: '12px 30px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
