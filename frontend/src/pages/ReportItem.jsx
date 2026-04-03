import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
    Package, 
    Tag, 
    Type, 
    AlignLeft, 
    MapPin, 
    Calendar, 
    Image as ImageIcon, 
    Upload, 
    Check, 
    Sparkles,
    Edit3
} from 'lucide-react';

const ReportItem = () => {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    
    const [formData, setFormData] = useState({
        type: 'Lost',
        itemName: '',
        category: 'Electronics',
        description: '',
        location: '',
        date: '',
        image: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validateField = (name, value) => {
        let errorMsg = '';
        switch (name) {
            case 'itemName':
                if (!value.trim()) errorMsg = 'Item name is required';
                else if (value.trim().length < 3) errorMsg = 'Name must be at least 3 characters';
                break;
            case 'description':
                if (!value.trim()) errorMsg = 'Description is required';
                else if (value.trim().length < 10) errorMsg = 'Description must be at least 10 characters';
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
                    if (selectedDate > today) errorMsg = 'Date cannot be in the future';
                }
                break;
            default:
                break;
        }
        setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
        return errorMsg;
    };

    useEffect(() => {
        if (isEditMode) {
            const fetchItem = async () => {
                try {
                    const user = JSON.parse(localStorage.getItem('user'));
                    const config = { headers: { Authorization: `Bearer ${user?.token}` } };
                    const { data } = await axios.get(`http://localhost:5000/api/lost-found/${id}`, config);
                    
                    const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : '';
                    
                    setFormData({
                        type: data.type,
                        itemName: data.itemName,
                        category: data.category,
                        description: data.description,
                        location: data.location,
                        date: formattedDate,
                        image: data.image
                    });
                } catch (err) {
                    console.error('Failed to fetch item details:', err);
                    setError('Failed to load item details');
                }
            };
            fetchItem();
        }
    }, [id, isEditMode]);

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
        
        // Final validation check
        const errors = {};
        Object.keys(formData).forEach(key => {
            const msg = validateField(key, formData[key]);
            if (msg) errors[key] = msg;
        });

        if (Object.values(errors).some(msg => msg !== '')) {
            setError('Please fix all validation errors before submitting');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            
            if (isEditMode) {
                await axios.put(`http://localhost:5000/api/lost-found/${id}`, formData, config);
            } else {
                await axios.post('http://localhost:5000/api/lost-found', formData, config);
            }
            navigate('/lost-and-found');
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'report'} item`);
            setSubmitting(false);
        }
    };

    return (
        <div style={{ padding: '2rem 5%', display: 'flex', justifyContent: 'center' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isEditMode ? 'Edit' : 'Report an'} <span style={{ color: '#6366f1' }}>Item</span> 
                    {isEditMode ? <Edit3 size={28} style={{ color: '#6366f1' }} /> : <Package size={28} style={{ color: '#6366f1' }} />}
                </h1>
                <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                    {isEditMode ? 'Update your item details below.' : "Lost something valuable or found someone's belongings? Post it here!"}
                </p>

                {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Tag size={14} /> Report Type
                            </label>
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
                            <label style={{ fontSize: '0.9rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Tag size={14} /> Category
                            </label>
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
                        <label style={{ fontSize: '0.9rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Type size={14} /> Item Name
                        </label>
                        <input
                            type="text"
                            name="itemName"
                            placeholder="e.g. Silver iPhone 13 Pro"
                            value={formData.itemName}
                            onChange={handleChange}
                            required
                            style={{ 
                                padding: '12px', 
                                background: 'rgba(255,255,255,0.05)', 
                                border: fieldErrors.itemName ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '8px', 
                                color: 'white', 
                                outline: 'none' 
                            }}
                        />
                        {fieldErrors.itemName && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{fieldErrors.itemName}</span>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlignLeft size={14} /> Description
                        </label>
                        <textarea
                            name="description"
                            placeholder="Describe the item, color, specific marks..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                            style={{ 
                                padding: '12px', 
                                background: 'rgba(255,255,255,0.05)', 
                                border: fieldErrors.description ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '8px', 
                                color: 'white', 
                                outline: 'none', 
                                minHeight: '100px' 
                            }}
                        />
                        {fieldErrors.description && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{fieldErrors.description}</span>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MapPin size={14} /> Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                placeholder="e.g. Main Auditorium"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                style={{ 
                                    padding: '12px', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    border: fieldErrors.location ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)', 
                                    borderRadius: '8px', 
                                    color: 'white', 
                                    outline: 'none' 
                                }}
                            />
                            {fieldErrors.location && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{fieldErrors.location}</span>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={14} /> Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                style={{ 
                                    padding: '12px', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    border: fieldErrors.date ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)', 
                                    borderRadius: '8px', 
                                    color: 'white', 
                                    outline: 'none' 
                                }}
                            />
                            {fieldErrors.date && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{fieldErrors.date}</span>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ImageIcon size={14} /> Photo (Optional)
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                id="file-upload"
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="file-upload" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px dashed rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}>
                                <Upload size={18} /> {uploading ? 'Uploading...' : 'Choose an image'}
                            </label>
                        </div>
                        {formData.image && (
                            <div style={{ position: 'relative', marginTop: '10px' }}>
                                <img src={`http://localhost:5000${formData.image}`} alt="Preview" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '8px' }} />
                                <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#10b981', color: 'white', borderRadius: '50%', padding: '4px' }}>
                                    <Check size={16} />
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: '1rem', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        {submitting ? 'Submitting...' : (
                            <>
                                <Check size={20} /> {isEditMode ? 'Update' : `Submit ${formData.type}`} Report
                            </>
                        )}
                    </button>
                    
                    {!isEditMode && (
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
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                            <Sparkles size={16} /> Demo Fill (For Presentation)
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ReportItem;
