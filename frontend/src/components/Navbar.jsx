// frontend/src/components/Navbar.jsx
// UPDATED: Adds "My Bookings" link for students and "Check-In" link for organizers.
// All existing links and logic are untouched.

import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { currentUser, logout } = useContext(AuthContext);
import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import NotificationDropdown from './NotificationDropdown';
import { 
    LayoutDashboard, 
    Compass, 
    MessageSquare, 
    User, 
    LogOut, 
    Calendar, 
    ShieldAlert, 
    ChevronRight,
    Menu
} from 'lucide-react';
import EventBuddyLogo from '../assets/EventBuddy.png';

const Navbar = () => {
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const { currentUser, logout, unreadCount } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinkStyle = {
        color: '#f8fafc',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'color 0.2s'
    };

    const activeNavLinkStyle = {
        ...navLinkStyle,
        color: '#6366f1'
    };

    const getLinkStyle = (path) => location.pathname === path ? activeNavLinkStyle : navLinkStyle;

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.2rem 5%',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                <img src={EventBuddyLogo} alt="EventBuddy" style={{ height: '40px', objectFit: 'contain' }} />
            </Link>

            <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                {currentUser && currentUser.role === 'student' && (
                    <>
<<<<<<< feature/induwari/qr-function
                        {currentUser.role === 'student' && (
                            <>
                                <Link to="/student-dashboard" style={{ color: '#f8fafc', textDecoration: 'none' }}>Dashboard</Link>
                                <Link to="/events" style={{ color: '#f8fafc', textDecoration: 'none' }}>Explore Events</Link>
                                {/* NEW */}
                                <Link to="/my-bookings" style={{ color: '#f8fafc', textDecoration: 'none' }}>My Bookings</Link>
                            </>
                        )}
                        {currentUser.role === 'organizer' && (
                            <>
                                <Link to="/organizer-dashboard" style={{ color: '#f8fafc', textDecoration: 'none' }}>Dashboard</Link>
                                <Link to="/organizer-events" style={{ color: '#f8fafc', textDecoration: 'none' }}>My Events</Link>
                                <Link to="/create-event" style={{ color: '#f8fafc', textDecoration: 'none' }}>Create Event</Link>
                                {/* NEW */}
                                <Link to="/checkin" style={{ color: '#f8fafc', textDecoration: 'none' }}>Check-In</Link>
                            </>
                        )}
                        {currentUser.role === 'admin' && (
                            <>
                                <Link to="/admin-dashboard" style={{ color: '#f8fafc', textDecoration: 'none' }}>Dashboard</Link>
                                <Link to="/admin/users" style={{ color: '#f8fafc', textDecoration: 'none' }}>Users</Link>
                                <Link to="/admin/events" style={{ color: '#f8fafc', textDecoration: 'none' }}>Events</Link>
                                {/* NEW */}
                                <Link to="/admin/bookings" style={{ color: '#f8fafc', textDecoration: 'none' }}>Bookings</Link>
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
=======
                        <Link to="/student-dashboard" style={getLinkStyle('/student-dashboard')}><LayoutDashboard size={18} /> Dashboard</Link>
                        <Link to="/events" style={getLinkStyle('/events')}><Compass size={18} /> Explore</Link>
                        <Link to="/chat" style={getLinkStyle('/chat')}>
                            <MessageSquare size={18} />
                            Messages
                            {unreadCount > 0 && (
                                <span style={{ 
                                    background: '#ef4444', 
                                    color: 'white', 
                                    fontSize: '0.7rem', 
                                    padding: '2px 7px', 
                                    borderRadius: '10px' 
                                }}>{unreadCount}</span>
                            )}
                        </Link>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)', height: '24px', margin: '0 5px' }}></div>
                        <Link to="/lost-and-found" style={{ ...navLinkStyle, color: '#e879f9', fontWeight: '800' }}><ShieldAlert size={18} /> Recovery</Link>
>>>>>>> main
                    </>
                )}

                {!currentUser && (
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <Link to="/login" style={{ color: '#f8fafc', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
                        <Link to="/register" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                            Get Started <ChevronRight size={18} />
                        </Link>
                    </div>
                )}

                {currentUser && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginLeft: '0.5rem' }}>
                        <NotificationDropdown currentUser={currentUser} />
                        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                            <div style={{ 
                                width: '36px', 
                                height: '36px', 
                                borderRadius: '50%', 
                                background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'white'
                            }}>
                                <User size={20} />
                            </div>
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>{currentUser.name.split(' ')[0]}</span>
                        </Link>
                        <button onClick={handleLogoutTrigger} style={{ 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            padding: '8px 16px', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                )}
            </div>
<<<<<<< feature/induwari/qr-function
=======

            <ConfirmModal
                isOpen={isLogoutModalOpen}
                title="Confirm Logout"
                message="Are you sure you want to log out?"
                onConfirm={confirmLogout}
                onCancel={() => setIsLogoutModalOpen(false)}
                confirmText="Logout"
                type="danger"
            />
>>>>>>> main
        </nav>
    );
};

export default Navbar;
