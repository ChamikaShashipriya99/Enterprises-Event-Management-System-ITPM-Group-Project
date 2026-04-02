import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import userService from '../services/userService';
import Skeleton from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';
import { 
    Users, 
    Search, 
    Filter, 
    Trash2, 
    User, 
    Mail, 
    Calendar, 
    ShieldCheck, 
    GraduationCap, 
    Zap,
    IdCard
} from 'lucide-react';

const AdminUsers = () => {
    // ... existing state and functions ...
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
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: '800' }}>User <span style={{ color: '#6366f1' }}>Management</span></h1>
                    <p style={{ color: '#94a3b8' }}>Directory of all registered enterprise members.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input
                            type="text"
                            placeholder="Search name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '10px 15px 10px 40px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: 'white',
                                minWidth: '220px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            style={{
                                padding: '10px 15px 10px 35px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: 'white',
                                outline: 'none',
                                cursor: 'pointer',
                                appearance: 'none'
                            }}
                        >
                            <option value="all" style={{color: 'black'}}>All Roles</option>
                            <option value="student" style={{color: 'black'}}>Student</option>
                            <option value="organizer" style={{color: 'black'}}>Organizer</option>
                            <option value="admin" style={{color: 'black'}}>Admin</option>
                        </select>
                        <Filter size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    </div>
                    <div className="glass-card" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                        Total Records: <span style={{ color: '#6366f1', fontWeight: 'bold' }}>{filteredUsers.length}</span>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ overflowX: 'auto', padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                            <th style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</th>
                            <th style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                            <th style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meta</th>
                            <th style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                        <Users size={48} opacity={0.2} />
                                        <p>No users found matching your filters.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="table-row-hover">
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
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#f8fafc' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <IdCard size={10} /> {user._id.substring(user._id.length - 8).toUpperCase()}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                            <Mail size={14} /> {user.email}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            width: 'fit-content',
                                            background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 
                                                       user.role === 'organizer' ? 'rgba(168, 85, 247, 0.1)' : 
                                                       'rgba(99, 102, 241, 0.1)',
                                            color: user.role === 'admin' ? '#ef4444' : 
                                                   user.role === 'organizer' ? '#a855f7' : 
                                                   '#6366f1',
                                            border: `1px solid ${user.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 
                                                               user.role === 'organizer' ? 'rgba(168, 85, 247, 0.2)' : 
                                                               'rgba(99, 102, 241, 0.2)'}`
                                        }}>
                                            {user.role === 'admin' ? <ShieldCheck size={12} /> : 
                                             user.role === 'organizer' ? <Zap size={12} /> : 
                                             <GraduationCap size={12} />}
                                            {user.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                                            <Calendar size={14} /> {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDeleteUser(user._id, user.name)}
                                            style={{
                                                padding: '8px',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: '#ef4444',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
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
