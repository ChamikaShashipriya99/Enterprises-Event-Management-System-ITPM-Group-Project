import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import NotificationDropdown from './NotificationDropdown';
import chatService from '../services/chatService';

const Navbar = () => {
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const { currentUser, logout, socket, unreadCount } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogoutTrigger = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        logout();
        setIsLogoutModalOpen(false);
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
                                <Link to="/events" style={{ color: '#f8fafc', textDecoration: 'none' }}>Explore Events</Link>
                                <Link to="/chat" style={{ color: '#f8fafc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    Messages
                                    {unreadCount > 0 && (
                                        <span style={{ 
                                            background: '#ef4444', 
                                            color: 'white', 
                                            fontSize: '0.65rem', 
                                            padding: '2px 6px', 
                                            borderRadius: '10px',
                                            fontWeight: 'bold'
                                        }}>{unreadCount}</span>
                                    )}
                                </Link>
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
                                <Link to="/admin/events" style={{ color: '#f8fafc', textDecoration: 'none' }}>Events</Link>
                                <Link to="/admin/lost-found" style={{ color: '#f8fafc', textDecoration: 'none' }}>Recovery Hub</Link>
                                <Link to="/admin/audit-logs" style={{ color: '#f8fafc', textDecoration: 'none' }}>Audit Logs</Link>
                                <Link to="/chat" style={{ color: '#f8fafc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    Messages
                                    {unreadCount > 0 && (
                                        <span style={{ 
                                            background: '#ef4444', 
                                            color: 'white', 
                                            fontSize: '0.65rem', 
                                            padding: '2px 6px', 
                                            borderRadius: '10px',
                                            fontWeight: 'bold'
                                        }}>{unreadCount}</span>
                                    )}
                                </Link>
                            </>
                        )}
                        
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', height: '24px', margin: '0 10px' }}></div>

                        <Link to="/lost-and-found" style={{ color: '#e879f9', textDecoration: 'none', fontWeight: 'bold' }}>Recovery Hub</Link>
                        <Link to="/profile" style={{ color: '#f8fafc', textDecoration: 'none' }}>Profile</Link>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                            <NotificationDropdown currentUser={currentUser} />
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px' }}>
                                {currentUser.name}
                            </span>
                            <button onClick={handleLogoutTrigger} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
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
            <ConfirmModal
                isOpen={isLogoutModalOpen}
                title="Confirm Logout"
                message="Are you sure you want to log out of your account?"
                onConfirm={confirmLogout}
                onCancel={() => setIsLogoutModalOpen(false)}
                confirmText="Logout"
                type="danger"
            />
        </nav>
    );
};

export default Navbar;
