import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { Image, User, Shield, Phone, Lock, Sparkles, X, Camera } from 'lucide-react';

const EditProfile = () => {
    const { currentUser, token, setUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        profilePicture: '',
        coverImage: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userService.getProfile(token);
                setFormData({
                    name: data.name,
                    phone: data.phone || '',
                    password: '',
                    profilePicture: data.profilePicture || '',
                    coverImage: data.coverImage || ''
                });
            } catch (err) {
                console.error('Failed to fetch profile', err);
            }
        };
        if (token) fetchProfile();
    }, [token]);

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        if (type === 'profile') setUploading(true);
        else setUploadingCover(true);

        try {
            const data = await userService.uploadImage(formDataUpload, token);
            setFormData(prev => ({ 
                ...prev, 
                [type === 'profile' ? 'profilePicture' : 'coverImage']: data.url 
            }));
            // We don't alert here to keep the flow smooth
        } catch (err) {
            console.error('Image upload failed', err);
            alert('Image upload failed');
        } finally {
            if (type === 'profile') setUploading(false);
            else setUploadingCover(false);
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
            setUser({ ...currentUser, ...updatedUser });
            navigate('/profile');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '80px 5% 40px', display: 'flex', justifyContent: 'center' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '700px', padding: '0', overflow: 'hidden' }}>
                
                {/* Header Preview Section */}
                <div style={{ 
                    height: '180px', 
                    background: formData.coverImage ? `url(http://localhost:5000${formData.coverImage}) center/cover` : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{ position: 'absolute', bottom: '15px', right: '15px', display: 'flex', gap: '10px' }}>
                        <input
                            type="file"
                            id="coverInput"
                            onChange={(e) => handleFileUpload(e, 'cover')}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />
                        <label
                            htmlFor="coverInput"
                            style={{
                                background: 'rgba(15, 23, 42, 0.8)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '10px',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Camera size={14} /> {uploadingCover ? 'Uploading...' : 'Change Cover'}
                        </label>
                        {formData.coverImage && (
                            <button
                                onClick={() => setFormData({ ...formData, coverImage: '' })}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.8)',
                                    color: 'white',
                                    padding: '8px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Avatar Preview */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-50px',
                        left: '40px',
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        border: '6px solid #0f172a',
                        background: '#0f172a',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        fontWeight: '800',
                        color: 'white'
                    }}>
                        {formData.profilePicture ? (
                            <img src={`http://localhost:5000${formData.profilePicture}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            formData.name?.charAt(0) || <User size={40} />
                        )}
                    </div>
                </div>

                <div style={{ padding: '70px 40px 40px' }}>
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'white', marginBottom: '8px' }}>Profile Settings</h2>
                        <p style={{ color: '#94a3b8' }}>Customize your identity and appearance on EventBuddy.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                            <div>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                    <input
                                        type="text"
                                        className="input-field"
                                        style={{ paddingLeft: '45px' }}
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({ ...formData, name: e.target.value });
                                            if (errors.name) setErrors({ ...errors, name: '' });
                                        }}
                                    />
                                </div>
                                {errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px' }}>{errors.name}</p>}
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>Phone Number</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                    <input
                                        type="text"
                                        className="input-field"
                                        style={{ paddingLeft: '45px' }}
                                        value={formData.phone}
                                        onChange={(e) => {
                                            setFormData({ ...formData, phone: e.target.value });
                                            if (errors.phone) setErrors({ ...errors, phone: '' });
                                        }}
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                                {errors.phone && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px' }}>{errors.phone}</p>}
                            </div>
                        </div>

                        <div style={{ marginBottom: '35px' }}>
                            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>Profile Picture</label>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <input
                                    type="file"
                                    id="profileInput"
                                    onChange={(e) => handleFileUpload(e, 'profile')}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                />
                                <label
                                    htmlFor="profileInput"
                                    className="btn-primary"
                                    style={{ padding: '10px 20px', fontSize: '0.85rem', cursor: 'pointer', flex: 1, textAlign: 'center' }}
                                >
                                    {uploading ? 'Processing...' : 'Upload New Avatar'}
                                </label>
                                {formData.profilePicture && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, profilePicture: '' })}
                                        style={{
                                            padding: '10px 20px',
                                            background: 'rgba(239, 68, 68, 0.05)',
                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                            borderRadius: '12px',
                                            color: '#ef4444',
                                            fontSize: '0.85rem',
                                            fontWeight: '700',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{ padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <Lock size={20} style={{ color: '#fbbf24' }} />
                                <span style={{ fontWeight: '700', color: 'white' }}>Password Update</span>
                            </div>
                            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>New Password (Security recommendation: 8+ characters)</label>
                            <input
                                type="password"
                                className="input-field"
                                value={formData.password}
                                onChange={(e) => {
                                    setFormData({ ...formData, password: e.target.value });
                                    if (errors.password) setErrors({ ...errors, password: '' });
                                }}
                                placeholder="Leave blank to keep current password"
                            />
                            <PasswordStrengthMeter password={formData.password} />
                            {errors.password && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px' }}>{errors.password}</p>}
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button 
                                type="submit" 
                                className="btn-primary" 
                                disabled={loading || uploading || uploadingCover} 
                                style={{ flex: 2, padding: '16px' }}
                            >
                                {loading ? 'Saving Identity...' : 'Save All Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                style={{
                                    flex: 1,
                                    padding: '16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white',
                                    borderRadius: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
