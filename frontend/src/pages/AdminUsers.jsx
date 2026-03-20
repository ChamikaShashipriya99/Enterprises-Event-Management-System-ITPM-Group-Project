import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import userService from '../services/userService';
import Skeleton from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [modal, setModal] = useState({ isOpen: false, userId: null, userName: '' });
    const { token } = useContext(AuthContext);

    const fetchUsers = async () => {
        try {
            const data = await userService.getAllUsers(token);
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchUsers();
    }, [token]);

    const handleDeleteUser = async (id, name) => {
        setModal({ isOpen: true, userId: id, userName: name });
    };

    const confirmDelete = async () => {
        try {
            await userService.adminDeleteUser(modal.userId, token);
            setUsers(users.filter(user => user._id !== modal.userId));
            setModal({ isOpen: false, userId: null, userName: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    };

    if (loading) return (
        <div style={{ padding: '40px 5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <Skeleton variant="title" width="300px" />
                    <Skeleton variant="text" width="250px" />
                </div>
                <Skeleton width="180px" height="45px" />
            </div>

            <div className="glass-card" style={{ padding: '0' }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                        <Skeleton width="15%" />
                        <Skeleton width="20%" />
                        <Skeleton width="25%" />
                        <Skeleton width="10%" />
                        <Skeleton width="10%" />
                    </div>
                ))}
            </div>
        </div>
    );

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div style={{ padding: '40px 5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>User Management</h1>
                    <p style={{ color: '#94a3b8' }}>Directory of all registered enterprise members.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            minWidth: '220px',
                            outline: 'none'
                        }}
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all" style={{color: 'black'}}>All Roles</option>
                        <option value="student" style={{color: 'black'}}>Student</option>
                        <option value="organizer" style={{color: 'black'}}>Organizer</option>
                        <option value="admin" style={{color: 'black'}}>Admin</option>
                    </select>
                    <div className="glass-card" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                        Total Records: <span style={{ color: '#6366f1', fontWeight: 'bold' }}>{filteredUsers.length}</span>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <th style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>USER ID</th>
                            <th style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>NAME</th>
                            <th style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>EMAIL</th>
                            <th style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>ROLE</th>
                            <th style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>JOINED</th>
                            <th style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No users found matching your filters.</td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '20px', fontSize: '0.8rem', color: '#64748b' }}>{user._id.substring(user._id.length - 8)}...</td>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ 
                                                width: '40px', 
                                                height: '40px', 
                                                borderRadius: '50%', 
                                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                fontWeight: 'bold', 
                                                flexShrink: 0, 
                                                overflow: 'hidden' 
                                            }}>
                                                {user.profilePicture ? (
                                                    <img 
                                                        src={`http://localhost:5000${user.profilePicture}`} 
                                                        alt={user.name} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                    />
                                                ) : (
                                                    <span style={{ fontSize: '1.1rem', color: 'white' }}>{user.name.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <span style={{ fontWeight: '600' }}>{user.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px', color: '#94a3b8' }}>{user.email}</td>
                                    <td style={{ padding: '20px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                            color: user.role === 'admin' ? '#ef4444' : '#6366f1'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px', color: '#64748b' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '20px' }}>
                                        <button
                                            onClick={() => handleDeleteUser(user._id, user.name)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={modal.isOpen}
                title="Delete User"
                message={`Are you sure you want to permanently delete user "${modal.userName}"? This action cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={() => setModal({ isOpen: false, userId: null, userName: '' })}
            />
        </div>
    );
};

export default AdminUsers;
