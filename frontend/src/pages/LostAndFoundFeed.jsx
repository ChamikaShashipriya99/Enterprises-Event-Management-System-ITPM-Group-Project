import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Skeleton from '../components/Skeleton';
import { 
    Search, 
    Plus, 
    MapPin, 
    Calendar, 
    User, 
    CheckCircle, 
    SearchX, 
    HelpCircle,
    Inbox,
    Filter,
    ArrowRight,
    Edit
} from 'lucide-react';

const LostAndFoundFeed = () => {
    // ... existing state and functions ...
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('All'); // 'All', 'Lost', 'Found'
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');

    const fetchItems = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/lost-found', config);
            setItems(data);
        } catch (err) {
            console.error('Failed to fetch items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleResolve = async (id) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            await axios.put(`http://localhost:5000/api/lost-found/${id}/resolve`, {}, config);
            toast.success('Item status updated to Resolved! ✅');
            
            // Re-fetch to update status
            fetchItems();
        } catch (err) {
            alert('Failed to resolve item');
        }
    };

    const displayItems = items.filter(item => {
        // Tab Filter
        let tabMatch = false;
        if (tab === 'All') tabMatch = true;
        else if (tab === 'My Reports') {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            tabMatch = currentUser && currentUser._id === item.reporter?._id;
        } else {
            tabMatch = item.type === tab;
        }
        if (!tabMatch) return false;

        // Category Filter
        if (categoryFilter !== 'All Categories' && item.category !== categoryFilter) return false;

        // Search Filter
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            const matchName = item.itemName.toLowerCase().includes(lowerSearch);
            const matchDesc = item.description.toLowerCase().includes(lowerSearch);
            if (!matchName && !matchDesc) return false;
        }

        return true;
    });

    return (
        <div style={{ padding: '40px 5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: '800' }}>
                        Recovery <span style={{ color: '#6366f1' }}>Hub</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Smart Lost & Found Network. Help return missing belongings.</p>
                </div>
                <Link to="/report-item" className="btn-primary" style={{ padding: '12px 24px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={20} /> Report Item
                </Link>
            </div>

            {/* Search and Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '30px', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['All', 'Lost', 'Found', 'My Reports'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            style={{
                                padding: '10px 24px',
                                background: tab === t ? '#6366f1' : 'rgba(255,255,255,0.05)',
                                color: 'white',
                                border: '1px solid',
                                borderColor: tab === t ? '#6366f1' : 'rgba(255,255,255,0.1)',
                                borderRadius: '30px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.2s',
                            }}
                        >
                            {t === 'All' ? 'All Items' : t}
                        </button>
                    ))}
                </div>

                {/* Search Bar & Category Dropdown */}
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', flex: 1, minWidth: '300px', justifyContent: 'flex-end', position: 'relative' }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input 
                            type="text" 
                            placeholder="Search items..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '10px 15px 10px 40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '100%', outline: 'none' }}
                        />
                    </div>
                    <select 
                        value={categoryFilter} 
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={{ padding: '10px 15px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', cursor: 'pointer' }}
                    >
                        <option value="All Categories" style={{color: 'black'}}>All Categories</option>
                        <option value="Electronics" style={{color: 'black'}}>Electronics</option>
                        <option value="Clothing" style={{color: 'black'}}>Clothing</option>
                        <option value="Wallet" style={{color: 'black'}}>Wallet / ID</option>
                        <option value="Keys" style={{color: 'black'}}>Keys</option>
                        <option value="Other" style={{color: 'black'}}>Other</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {[1, 2, 3].map(n => (
                        <div key={n} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <Skeleton height="180px" borderRadius="0" />
                            <div style={{ padding: '20px' }}>
                                <Skeleton variant="title" width="80%" />
                                <Skeleton variant="text" width="100%" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : displayItems.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <SearchX size={64} style={{ color: '#64748b', marginBottom: '10px' }} />
                    <h3 style={{ fontSize: '1.5rem' }}>No {tab !== 'All' ? tab.toLowerCase() : ''} items reported</h3>
                    <p style={{ color: '#94a3b8', maxWidth: '400px' }}>Be a hero. Keep an eye out for people's lost belongings and report them here!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {displayItems.map((item) => {
                        const isLost = item.type === 'Lost';
                        const currentUser = JSON.parse(localStorage.getItem('user'));
                        const isOwner = currentUser && currentUser._id === item.reporter?._id;
                        const isAdmin = currentUser && currentUser.role === 'admin';

                        return (
                            <div key={item._id} className="glass-card" style={{ 
                                padding: '0', 
                                overflow: 'hidden', 
                                display: 'flex', 
                                flexDirection: 'column',
                                opacity: item.status === 'Resolved' ? 0.6 : 1,
                                filter: item.status === 'Resolved' ? 'grayscale(50%)' : 'none',
                                transition: 'all 0.3s ease'
                            }}>
                                {/* Banner Image or Color */}
                                {item.image ? (
                                    <img src={`http://localhost:5000${item.image}`} alt={item.itemName} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ 
                                        width: '100%', 
                                        height: '180px', 
                                        background: isLost ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <span style={{ color: 'white' }}>{isLost ? <HelpCircle size={64} /> : <Search size={64} />}</span>
                                    </div>
                                )}

                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{item.itemName}</h3>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            background: isLost ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            color: isLost ? '#ef4444' : '#10b981'
                                        }}>
                                            {item.type.toUpperCase()}
                                        </span>
                                    </div>

                                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '15px', flex: 1, lineHeight: '1.5' }}>{item.description}</p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <MapPin size={14} style={{ color: '#6366f1' }} /> {item.location}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={14} style={{ color: '#6366f1' }} /> {new Date(item.date).toLocaleDateString()}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <User size={14} style={{ color: '#6366f1' }} /> Reported by {item.reporter?.name || 'Unknown'}
                                        </div>
                                    </div>

                                    {item.status === 'Resolved' ? (
                                        <div style={{ width: '100%', padding: '12px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <CheckCircle size={18} /> Returned successfully
                                        </div>
                                    ) : (
                                        (isOwner || isAdmin) && (
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button 
                                                    onClick={() => handleResolve(item._id)}
                                                    className="btn-primary" 
                                                    style={{ flex: 2, padding: '12px', background: 'transparent', border: '1px solid #10b981', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                >
                                                    Mark as {isLost ? 'Found' : 'Returned'} <ArrowRight size={18} />
                                                </button>
                                                <Link 
                                                    to={`/edit-item/${item._id}`}
                                                    style={{ 
                                                        flex: 1, 
                                                        padding: '12px', 
                                                        background: 'rgba(99, 102, 241, 0.1)', 
                                                        border: '1px solid #6366f1', 
                                                        color: '#6366f1', 
                                                        borderRadius: '8px',
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center', 
                                                        textDecoration: 'none' 
                                                    }}
                                                    title="Edit Report"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LostAndFoundFeed;
