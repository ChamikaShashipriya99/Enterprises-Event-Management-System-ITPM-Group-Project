import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ReportItem = () => {
    const [formData, setFormData] = useState({
        type: 'Lost',
        itemName: '',
        category: 'Electronics',
        description: '',
        location: '',
        date: '',
        image: ''
    });
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);
        setUploading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user?.token}`
                }
            };
            const { data } = await axios.post('http://localhost:5000/api/users/upload', uploadData, config);
            setFormData(prev => ({ ...prev, image: data.url }));
            setUploading(false);
        } catch (err) {
            console.error(err);
            setUploading(false);
            setError('Image upload failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            
            await axios.post('http://localhost:5000/api/lost-found', formData, config);
            navigate('/lost-and-found');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to report item');
            setSubmitting(false);
        }
    };

    return (
        <div style={{ padding: '2rem 5%', display: 'flex', justifyContent: 'center' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '800' }}>
                    Report an <span style={{ color: '#6366f1' }}>Item</span>
                </h1>
                <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Lost something valuable or found someone's belongings? Post it here!</p>

                {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#f8fafc' }}>Report Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
                            >
                                <option value="Lost" style={{ color: 'black' }}>I Lost an Item</option>
                                <option value="Found" style={{ color: 'black' }}>I Found an Item</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#f8fafc' }}>Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
                            >
                                <option value="Electronics" style={{ color: 'black' }}>Electronics</option>
                                <option value="Clothing" style={{ color: 'black' }}>Clothing</option>
                                <option value="Wallet" style={{ color: 'black' }}>Wallet / ID</option>
                                <option value="Keys" style={{ color: 'black' }}>Keys</option>
                                <option value="Other" style={{ color: 'black' }}>Other</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: '#f8fafc' }}>Item Name</label>
                        <input
                            type="text"
                            name="itemName"
                            placeholder="e.g. Silver iPhone 13 Pro"
                            value={formData.itemName}
                            onChange={handleChange}
                            required
                            style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: '#f8fafc' }}>Description</label>
                        <textarea
                            name="description"
                            placeholder="Describe the item, color, specific marks..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                            style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none', minHeight: '100px' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#f8fafc' }}>Location</label>
                            <input
                                type="text"
                                name="location"
                                placeholder="e.g. Main Auditorium"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#f8fafc' }}>Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: '#f8fafc' }}>Photo (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ 
                                padding: '10px', 
                                background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '8px', 
                                color: 'white' 
                            }}
                        />
                        {uploading && <p style={{ color: '#6366f1', fontSize: '0.85rem' }}>Uploading Image...</p>}
                        {formData.image && (
                            <img src={`http://localhost:5000${formData.image}`} alt="Preview" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' }} />
                        )}
                    </div>

                    <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: '1rem', padding: '14px' }}>
                        {submitting ? 'Submitting...' : `Submit ${formData.type} Report`}
                    </button>
                    
                    {/* DEMO FILL BUTTON for Presentation */}
                    <button type="button" onClick={() => {
                        setFormData({
                            type: 'Lost',
                            itemName: 'Apple AirPods Pro',
                            category: 'Electronics',
                            description: 'White AirPods Pro case with a small scratch on the back. Has both earbuds inside.',
                            location: 'Library 3rd Floor',
                            date: new Date().toISOString().split('T')[0],
                            image: ''
                        });
                    }} style={{
                        padding: '10px',
                        background: 'transparent',
                        border: '1px dashed rgba(255,255,255,0.2)',
                        color: '#94a3b8',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}>
                        Demo Fill (For Presentation)
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReportItem;
