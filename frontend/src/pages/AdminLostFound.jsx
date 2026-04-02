import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Skeleton from '../components/Skeleton';
import { 
    Search, 
    Filter, 
    ShieldAlert, 
    CheckCircle, 
    Clock, 
    User, 
    Calendar, 
    Tag, 
    MoreHorizontal,
    Inbox,
    Package
} from 'lucide-react';

const AdminLostFound = () => {
    // ... existing state and functions ...
    const { currentUser } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchItems = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${currentUser?.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/lost-found', config);
            setItems(data);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchItems();
        }
    }, [currentUser]);

    const handleResolve = async (id) => {
        if (!window.confirm('Are you sure you want to resolve this report?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${currentUser?.token}` } };
            await axios.put(`http://localhost:5000/api/lost-found/${id}/resolve`, {}, config);
            fetchItems();
        } catch (error) {
            alert('Failed to resolve item');
        }
    };

    const filteredItems = items.filter(item => {
        // Type Filter
        if (typeFilter !== 'All' && item.type !== typeFilter) return false;
        
        // Status Filter
        if (statusFilter !== 'All' && item.status !== statusFilter) return false;

        // Search Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const hitName = item.itemName.toLowerCase().includes(term);
            const hitCategory = item.category.toLowerCase().includes(term);
            const hitReporter = item.reporter?.name?.toLowerCase().includes(term);
            if (!hitName && !hitCategory && !hitReporter) return false;
        }

        return true;
    });

    return (
        <div style={{ padding: '2rem 5%' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '800' }}>
                Lost & Found <span style={{ color: '#6366f1' }}>Moderation</span>
            </h1>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Manage and resolve user reports from the recovery hub.</p>

            {/* Admin Search & Filters */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input 
                        type="text" 
                        placeholder="Search by Item, Category, or Reporter..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '12px 15px 12px 40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                    />
                </div>
                <div style={{ position: 'relative' }}>
                    <select 
                        value={typeFilter} 
                        onChange={(e) => setTypeFilter(e.target.value)}
                        style={{ padding: '12px 15px 12px 35px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', cursor: 'pointer', appearance: 'none' }}
                    >
                        <option value="All" style={{ color: 'black' }}>All Types</option>
                        <option value="Lost" style={{ color: 'black' }}>Lost Only</option>
                        <option value="Found" style={{ color: 'black' }}>Found Only</option>
                    </select>
                    <Filter size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                </div>
                <div style={{ position: 'relative' }}>
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: '12px 15px 12px 35px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', cursor: 'pointer', appearance: 'none' }}
                    >
                        <option value="All" style={{ color: 'black' }}>All Statuses</option>
                        <option value="Active" style={{ color: 'black' }}>Active</option>
                        <option value="Resolved" style={{ color: 'black' }}>Resolved</option>
                    </select>
                    <Clock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                </div>
            </div>

            {/* Items Table */}
            <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <th style={{ padding: '15px 20px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Item</th>
                            <th style={{ padding: '15px 20px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Category</th>
                            <th style={{ padding: '15px 20px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Reporter</th>
                            <th style={{ padding: '15px 20px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Date</th>
                            <th style={{ padding: '15px 20px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '15px 20px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from(new Array(5)).map((_, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <td style={{ padding: '15px 20px' }}><Skeleton variant="text" width="80%" /></td>
                                    <td style={{ padding: '15px 20px' }}><Skeleton variant="text" width="70%" /></td>
                                    <td style={{ padding: '15px 20px' }}><Skeleton variant="text" width="60%" /></td>
                                    <td style={{ padding: '15px 20px' }}><Skeleton variant="text" width="90%" /></td>
                                    <td style={{ padding: '15px 20px' }}><Skeleton variant="text" width="40%" /></td>
                                    <td style={{ padding: '15px 20px' }}><Skeleton variant="text" width="100%" /></td>
                                </tr>
                            ))
                        ) : filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                        <Inbox size={48} opacity={0.2} />
                                        <p>No reports found matching your criteria.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map(item => (
                                <tr key={item._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s' }} className="table-row-hover">
                                    <td style={{ padding: '15px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Package size={16} style={{ color: item.type === 'Lost' ? '#ef4444' : '#10b981' }} />
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#f8fafc' }}>{item.itemName}</div>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: item.type === 'Lost' ? '#ef4444' : '#10b981', textTransform: 'uppercase' }}>{item.type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                                            <Tag size={14} style={{ color: '#6366f1' }} /> {item.category}
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                                            <User size={14} style={{ color: '#6366f1' }} /> {item.reporter?.name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                                            <Calendar size={14} style={{ color: '#6366f1' }} /> {new Date(item.date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            width: 'fit-content',
                                            background: item.status === 'Resolved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: item.status === 'Resolved' ? '#10b981' : '#f59e0b',
                                            border: `1px solid ${item.status === 'Resolved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                        }}>
                                            {item.status === 'Resolved' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                            {item.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                        {item.status === 'Active' ? (
                                            <button 
                                                onClick={() => handleResolve(item._id)}
                                                style={{ padding: '8px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}
                                                title="Force Resolve"
                                            >
                                                <CheckCircle size={14} /> Resolve
                                            </button>
                                        ) : (
                                            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Closed</div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminLostFound;
