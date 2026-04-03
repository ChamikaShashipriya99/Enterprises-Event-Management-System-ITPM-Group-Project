import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';

const CreateEvent = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        date: '',
        capacity: '',
        image: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validateField = (name, value) => {
        let errorMsg = '';
        switch (name) {
            case 'title':
                if (!value.trim()) errorMsg = 'Title is required';
                else if (value.trim().length < 5) errorMsg = 'Title must be at least 5 characters';
                break;
            case 'description':
                if (!value.trim()) errorMsg = 'Description is required';
                else if (value.trim().length < 20) errorMsg = 'Description must be at least 20 characters';
                break;
            case 'location':
                if (!value.trim()) errorMsg = 'Location is required';
                break;
            case 'date':
                if (!value) errorMsg = 'Date is required';
                else {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selectedDate < today) errorMsg = 'Event date must be today or in the future';
                }
                break;
            case 'capacity':
                if (!value) errorMsg = 'Capacity is required';
                else if (value < 1) errorMsg = 'Capacity must be at least 1';
                break;
            default:
                break;
        }
        setErrors(prev => ({ ...prev, [name]: errorMsg }));
        return errorMsg;
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const msg = validateField(key, formData[key]);
            if (msg) newErrors[key] = msg;
        });
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        validateField(name, value);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);
        setUploading(true);

        try {
            const data = await eventService.uploadImage(uploadData);
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
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            await eventService.createEvent(formData);
            navigate('/organizer-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event');
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem 5%', display: 'flex', justifyContent: 'center' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '800' }}>Create <span style={{ color: '#a855f7' }}>New Event</span></h1>
                <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Fill in the details to orchestrate your next major event.</p>

                {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: '#f8fafc' }}>Event Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Annual Tech Symposium"
                            style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: errors.title ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                        />
                        {errors.title && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-10px' }}>{errors.title}</p>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: '#f8fafc' }}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the orchestration goals..."
                            style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: errors.description ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', minHeight: '120px' }}
                        />
                        {errors.description && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-10px' }}>{errors.description}</p>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#f8fafc' }}>Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Virtual / Physical Address"
                                style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: errors.location ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                            />
                            {errors.location && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0' }}>{errors.location}</p>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#f8fafc' }}>Event Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: errors.date ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                            />
                            {errors.date && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0' }}>{errors.date}</p>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: '#f8fafc' }}>Max Capacity</label>
                        <input
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            placeholder="e.g. 100"
                            style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: errors.capacity ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                        />
                        {errors.capacity && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-10px' }}>{errors.capacity}</p>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: '#f8fafc' }}>Event Poster</label>
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
                        {uploading && <p style={{ color: '#6366f1', fontSize: '0.85rem' }}>Uploading your poster...</p>}
                        {formData.image && (
                            <img src={`http://localhost:5000${formData.image}`} alt="Event Preview" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' }} />
                        )}
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'Orchestrating...' : 'Initialize Event'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateEvent;
