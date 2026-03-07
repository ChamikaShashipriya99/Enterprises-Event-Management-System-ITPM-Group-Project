import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

const EditProfile = () => {
    const { currentUser, token, setUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        profilePicture: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        setUploading(true);
        try {
            const data = await userService.uploadImage(formDataUpload, token);
            setFormData({ ...formData, profilePicture: data.url });
            alert('Image uploaded successfully');
        } catch (err) {
            console.error('Image upload failed', err);
            alert('Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        let newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';

        if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number format';
        }

        if (formData.password && formData.password.length < 8) {
            newErrors.password = 'New password must be at least 8 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const updatedUser = await userService.updateProfile(formData, token);
            setUser(updatedUser);
            alert('Profile updated successfully');
            navigate('/profile');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update profile');
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
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                if (errors.name) setErrors({ ...errors, name: '' });
                            }}
                        />
                        {errors.name && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '5px' }}>{errors.name}</p>}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Phone Number</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.phone}
                            onChange={(e) => {
                                setFormData({ ...formData, phone: e.target.value });
                                if (errors.phone) setErrors({ ...errors, phone: '' });
                            }}
                            placeholder="+1 (555) 000-0000"
                        />
                        {errors.phone && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '5px' }}>{errors.phone}</p>}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>New Password (leave blank to keep current)</label>
                        <input
                            type="password"
                            className="input-field"
                            value={formData.password}
                            onChange={(e) => {
                                setFormData({ ...formData, password: e.target.value });
                                if (errors.password) setErrors({ ...errors, password: '' });
                            }}
                            placeholder="••••••••"
                        />
                        <PasswordStrengthMeter password={formData.password} />
                        {errors.password && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '5px' }}>{errors.password}</p>}
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Profile Picture</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {formData.profilePicture && (
                                <img
                                    src={`http://localhost:5000${formData.profilePicture}`}
                                    alt="Profile"
                                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6366f1' }}
                                />
                            )}
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    id="fileInput"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                    accept="image/png, image/jpeg, image/jpg"
                                />
                                <label
                                    htmlFor="fileInput"
                                    style={{
                                        padding: '10px 20px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#6366f1',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'inline-block',
                                        transition: 'all 0.3s ease',
                                        textAlign: 'center'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                                        e.currentTarget.style.borderColor = '#6366f1';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                    }}
                                >
                                    {uploading ? 'Processing...' : 'Change Picture'}
                                </label>
                            </div>
                        </div>
                        {uploading && <p style={{ color: '#6366f1', fontSize: '0.8rem', marginTop: '10px', fontWeight: '500' }}>Uploading image, please wait...</p>}
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
