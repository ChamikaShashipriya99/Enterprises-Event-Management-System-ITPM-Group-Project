import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';

const CreateEvent = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        date: '',
        capacity: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        let newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';

        if (!formData.date) {
            newErrors.date = 'Date is required';
        } else if (new Date(formData.date) < new Date()) {
            newErrors.date = 'Event date must be in the future';
        }

        if (!formData.capacity || formData.capacity < 1) {
            newErrors.capacity = 'Capacity must be at least 1';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
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

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'Orchestrating...' : 'Initialize Event'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateEvent;
