import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import userService from '../services/userService';

const Profile = () => {
    const { currentUser, token, logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userService.getProfile(token);
                setProfile(data);
            } catch (err) {
                console.error('Failed to fetch profile', err);
            }
        };
        if (token) fetchProfile();
    }, [token]);

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
