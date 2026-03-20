import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Skeleton from '../components/Skeleton';

const AdminLostFound = () => {
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
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '800' }}>
                Lost & Found <span style={{ color: '#6366f1' }}>Moderation</span>
            </h1>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Manage and resolve user reports from the recovery hub.</p>

            {/* Admin Search & Filters */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input 
                    type="text" 
                    placeholder="Search by Item, Category, or Reporter..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1, minWidth: '250px', padding: '12px 15px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                />
                <select 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                    style={{ padding: '12px 15px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', cursor: 'pointer' }}
                >
                    <option value="All" style={{ color: 'black' }}>All Types</option>
                    <option value="Lost" style={{ color: 'black' }}>Lost Only</option>
                    <option value="Found" style={{ color: 'black' }}>Found Only</option>
                </select>
                <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '12px 15px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', cursor: 'pointer' }}
                >
                    <option value="All" style={{ color: 'black' }}>All Statuses</option>
                    <option value="Active" style={{ color: 'black' }}>Active</option>
                    <option value="Resolved" style={{ color: 'black' }}>Resolved</option>
                </select>
            </div>

            {/* Items Table */}
            <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <th style={{ padding: '15px 20px', color: '#94a3b8', fontWeight: '600' }}>Item Name</th>
                            <th style={{ padding: '15px 20px', color: '#94a3b8', fontWeight: '600' }}>Type</th>
                            <th style={{ padding: '15px 20px', color: '#94a3b8', fontWeight: '600' }}>Category</th>
                            <th style={{ padding: '15px 20px', color: '#94a3b8', fontWeight: '600' }}>Reporter</th>
                            <th style={{ padding: '15px 20px', color: '#94a3b8', fontWeight: '600' }}>Date</th>
                            <th style={{ padding: '15px 20px', color: '#94a3b8', fontWeight: '600' }}>Status</th>
                            <th style={{ padding: '15px 20px', color: '#94a3b8', fontWeight: '600', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from(new Array(5)).map((_, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <td style={{ padding: '15px 20px' }}><Skeleton variant="text" width="80%" /></td>
                                    <td style={{ padding: '15px 20px' }}><Skeleton variant="text" width="50%" /></td>
                                    <td style={{ padding: '15px 20px' }}><Skeleton variant="text" width="70%" /></td>
                                    <td style={{ padding: '15px 20px' }}><Skeleton variant="text" width="60%" /></td>
                                    <td style={{ padding: '15px 20px' }}><Skeleton variant="text" width="90%" /></td>
                                    <td style={{ padding: '15px 20px' }}><Skeleton variant="text" width="40%" /></td>
                                    <td style={{ padding: '15px 20px' }}><Skeleton variant="text" width="100%" /></td>
                                </tr>
                            ))
                        ) : filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                    No reports found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map(item => (
                                <tr key={item._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>{item.itemName}</td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            background: item.type === 'Lost' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            color: item.type === 'Lost' ? '#ef4444' : '#10b981'
                                        }}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>{item.category}</td>
                                    <td style={{ padding: '15px 20px' }}>{item.reporter?.name || 'Unknown'}</td>
                                    <td style={{ padding: '15px 20px' }}>{new Date(item.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{ color: item.status === 'Resolved' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                        {item.status === 'Active' ? (
                                            <button 
                                                onClick={() => handleResolve(item._id)}
                                                style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #10b981', color: '#10b981', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                title="Force Resolve"
                                            >
                                                Resolve
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>N/A</span>
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
