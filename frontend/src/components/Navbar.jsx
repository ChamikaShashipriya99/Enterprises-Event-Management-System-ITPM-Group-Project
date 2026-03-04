import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem 5%',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <Link to="/" style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                EventBuddy
            </Link>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                {currentUser ? (
                    <>
                        {currentUser.role === 'student' && (
                            <>
                                <Link to="/student-dashboard" style={{ color: '#f8fafc', textDecoration: 'none' }}>Dashboard</Link>
                            </>
                        )}
                        {currentUser.role === 'organizer' && (
                            <>
                                <Link to="/organizer-dashboard" style={{ color: '#f8fafc', textDecoration: 'none' }}>Dashboard</Link>
                                <Link to="/organizer-events" style={{ color: '#f8fafc', textDecoration: 'none' }}>My Events</Link>
                                <Link to="/create-event" style={{ color: '#f8fafc', textDecoration: 'none' }}>Create Event</Link>
                            </>
                        )}
                        {currentUser.role === 'admin' && (
                            <>
                                <Link to="/admin-dashboard" style={{ color: '#f8fafc', textDecoration: 'none' }}>Dashboard</Link>
                                <Link to="/admin/users" style={{ color: '#f8fafc', textDecoration: 'none' }}>Users</Link>
                                <button style={{ color: '#f8fafc', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.6 }}>Events</button>
                            </>
                        )}
                        <Link to="/profile" style={{ color: '#f8fafc', textDecoration: 'none' }}>Profile</Link>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px' }}>
                                {currentUser.name}
                            </span>
                            <button onClick={handleLogout} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: '#f8fafc' }}>Login</Link>
                        <Link to="/register" className="btn-primary">Get Started</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
