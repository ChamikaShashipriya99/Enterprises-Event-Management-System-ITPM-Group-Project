// frontend/src/components/Navbar.jsx
import { useContext, useState } from 'react';
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
    ShieldAlert, 
    ChevronRight,
    Calendar,
    Zap,
    Plus,
    Users
} from 'lucide-react';
import EventBuddyLogo from '../assets/EventBuddy.png';

const Navbar = () => {
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const { currentUser, logout, unreadCount } = useContext(AuthContext);
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

    const navLinkStyle = {
        color: '#f8fafc',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'all 0.2s ease'
    };

    const activeNavLinkStyle = {
        ...navLinkStyle,
        color: '#6366f1'
    };

    const getLinkStyle = (path) => {
        const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
        return isActive ? activeNavLinkStyle : navLinkStyle;
    };

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
            <Link to="/" style={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                <img src={EventBuddyLogo} alt="EventBuddy" style={{ height: '40px', objectFit: 'contain' }} />
            </Link>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                {currentUser && (
                    <>
                        {/* Student perspective */}
                        {currentUser.role === 'student' && (
                            <>
                                <Link to="/student-dashboard" style={getLinkStyle('/student-dashboard')}>
                                    <LayoutDashboard size={18} /> Dashboard
                                </Link>
                                <Link to="/events" style={getLinkStyle('/events')}>
                                    <Compass size={18} /> Explore
                                </Link>
                                <Link to="/my-bookings" style={getLinkStyle('/my-bookings')}>
                                    <Calendar size={18} /> My Bookings
                                </Link>
                            </>
                        )}

                        {/* Organizer perspective */}
                        {currentUser.role === 'organizer' && (
                            <>
                                <Link to="/organizer-dashboard" style={getLinkStyle('/organizer-dashboard')}>
                                    <LayoutDashboard size={18} /> Dashboard
                                </Link>
                                <Link to="/organizer-events" style={getLinkStyle('/organizer-events')}>
                                    <Calendar size={18} /> My Events
                                </Link>
                                <Link to="/create-event" style={getLinkStyle('/create-event')}>
                                    <Plus size={18} /> Create
                                </Link>
                                <Link to="/checkin" style={getLinkStyle('/checkin')}>
                                    <Zap size={18} /> Check-In
                                </Link>
                            </>
                        )}

                        {/* Admin perspective */}
                        {currentUser.role === 'admin' && (
                            <>
                                <Link to="/admin-dashboard" style={getLinkStyle('/admin-dashboard')}>
                                    <LayoutDashboard size={18} /> Dashboard
                                </Link>
                                <Link to="/admin/users" style={getLinkStyle('/admin/users')}>
                                    <Users size={18} /> Users
                                </Link>
                                <Link to="/admin/events" style={getLinkStyle('/admin/events')}>
                                    <Calendar size={18} /> Events
                                </Link>
                                <Link to="/admin/bookings" style={getLinkStyle('/admin/bookings')}>
                                    <Zap size={18} /> Bookings
                                </Link>
                            </>
                        )}

                        {/* Common Authorized Links */}
                        <Link to="/chat" style={getLinkStyle('/chat')}>
                            <MessageSquare size={18} /> Messages
                            {unreadCount > 0 && (
                                <span style={{ 
                                    background: '#ef4444', 
                                    color: 'white', 
                                    fontSize: '0.7rem', 
                                    padding: '2px 7px', 
                                    borderRadius: '10px',
                                    marginLeft: '4px'
                                }}>{unreadCount}</span>
                            )}
                        </Link>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', height: '20px' }}></div>
                        <Link to="/lost-and-found" style={{ ...navLinkStyle, color: '#e879f9', fontWeight: '700' }}>
                            <ShieldAlert size={18} /> Recovery
                        </Link>
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
                            gap: '8px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(239, 68, 68, 0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background='rgba(239, 68, 68, 0.1)'}
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isLogoutModalOpen}
                title="Confirm Logout"
                message="Are you sure you want to log out?"
                onConfirm={confirmLogout}
                onCancel={() => setIsLogoutModalOpen(false)}
                confirmText="Logout"
                type="danger"
            />
        </nav>
    );
};

export default Navbar;
