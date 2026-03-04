import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';

const EditProfile = () => {
    const { currentUser, token, setUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        profilePicture: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userService.getProfile(token);
                setFormData({
                    name: data.name,
                    phone: data.phone || '',
                    password: '',
                    profilePicture: data.profilePicture || ''
                });
            } catch (err) {
                console.error('Failed to fetch profile', err);
            }
        };
        if (token) fetchProfile();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updatedUser = await userService.updateProfile(formData, token);
            setUser(updatedUser);
            alert('Profile updated successfully');
            navigate('/profile');
        } catch (err) {
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px 5%', display: 'flex', justifyContent: 'center' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '40px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Edit Profile</h2>
                <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Update your personal information</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Full Name</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Phone Number</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>New Password (leave blank to keep current)</label>
                        <input
                            type="password"
                            className="input-field"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Profile Picture URL</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.profilePicture}
                            onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
                            {loading ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/profile')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
