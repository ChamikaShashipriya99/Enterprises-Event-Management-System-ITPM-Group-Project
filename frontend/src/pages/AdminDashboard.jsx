import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import userService from '../services/userService';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { currentUser, token } = useContext(AuthContext);
    const [stats, setStats] = useState({ totalUsers: 0, totalStudents: 0, totalAdmins: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await userService.getUserStats(token);
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch stats', err);
            }
        };
        if (token) fetchStats();
    }, [token]);

    return (
        <div style={{ padding: '40px 5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Administrative Console</h1>
                    <p style={{ color: '#94a3b8' }}>System wide control and monitoring for {currentUser?.name}.</p>
                </div>
                <Link to="/admin/users" className="btn-primary">Manage Users</Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                <div className="glass-card" style={{ padding: '30px', borderTop: '4px solid #6366f1' }}>
                    <h3 style={{ color: '#6366f1', marginBottom: '15px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em' }}>Infrastructure</h3>
                    <h2 style={{ marginBottom: '5px', fontSize: '2rem' }}>{stats.totalUsers}</h2>
                    <p style={{ color: '#94a3b8' }}>Total Registered Users</p>
                </div>

                <div className="glass-card" style={{ padding: '30px', borderTop: '4px solid #10b981' }}>
                    <h3 style={{ color: '#10b981', marginBottom: '15px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em' }}>Engagement</h3>
                    <h2 style={{ marginBottom: '5px', fontSize: '2rem' }}>{stats.totalStudents}</h2>
                    <p style={{ color: '#94a3b8' }}>Active Students</p>
                </div>

                <div className="glass-card" style={{ padding: '30px', borderTop: '40px solid #ef4444' }}>
                    <h3 style={{ color: '#ef4444', marginBottom: '15px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em' }}>Governance</h3>
                    <h2 style={{ marginBottom: '5px', fontSize: '2rem' }}>{stats.totalAdmins}</h2>
                    <p style={{ color: '#94a3b8' }}>System Administrators</p>
                </div>
            </div>

            <div className="glass-card" style={{ marginTop: '40px', padding: '30px' }}>
                <h2 style={{ marginBottom: '20px' }}>Recent System Activity</h2>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.9rem' }}>
                            <span>User registration: new_user_{i}@example.com</span>
                            <span>{i * 2} hours ago</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
