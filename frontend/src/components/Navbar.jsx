import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import NotificationDropdown from './NotificationDropdown';
import chatService from '../services/chatService';
import { 
    LayoutDashboard, 
    Compass, 
    MessageSquare, 
    User, 
    LogOut, 
    Users, 
    Calendar, 
    ShieldAlert, 
    History,
    Search,
    ChevronRight
} from 'lucide-react';

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
            <Link to="/" style={{
                fontSize: '1.6rem',
                fontWeight: '900',
                color: 'white',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={20} color="white" />
                </div>
                EventBuddy
            </Link>

            <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                {currentUser ? (
                    <>
                        {currentUser.role === 'student' && (
                            <>
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
                                            borderRadius: '10px',
                                            fontWeight: '800',
                                            boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)'
                                        }}>{unreadCount}</span>
                                    )}
                                </Link>
                            </>
                        )}
                        {currentUser.role === 'organizer' && (
                            <>
                                <Link to="/organizer-dashboard" style={getLinkStyle('/organizer-dashboard')}><LayoutDashboard size={18} /> Dashboard</Link>
                                <Link to="/organizer-events" style={getLinkStyle('/organizer-events')}><Calendar size={18} /> My Events</Link>
                                <Link to="/chat" style={getLinkStyle('/chat')}>
                                    <MessageSquare size={18} />
                                    Messages
                                    {unreadCount > 0 && (
                                        <span style={{ 
                                            background: '#ef4444', 
                                            color: 'white', 
                                            fontSize: '0.7rem', 
                                            padding: '2px 7px', 
                                            borderRadius: '10px',
                                            fontWeight: '800'
                                        }}>{unreadCount}</span>
                                    )}
                                </Link>
                            </>
                        )}
                        {currentUser.role === 'admin' && (
                            <>
                                <Link to="/admin-dashboard" style={getLinkStyle('/admin-dashboard')}><LayoutDashboard size={18} /> Stats</Link>
                                <Link to="/admin/users" style={getLinkStyle('/admin/users')}><Users size={18} /> Users</Link>
                                <Link to="/admin/events" style={getLinkStyle('/admin/events')}><Calendar size={18} /> Events</Link>
                                <Link to="/admin/audit-logs" style={getLinkStyle('/admin/audit-logs')}><History size={18} /> Logs</Link>
                                <Link to="/chat" style={getLinkStyle('/chat')}>
                                    <MessageSquare size={18} />
                                    Messages
                                    {unreadCount > 0 && (
                                        <span style={{ 
                                            background: '#ef4444', 
                                            color: 'white', 
                                            fontSize: '0.7rem', 
                                            padding: '2px 7px', 
                                            borderRadius: '10px',
                                            fontWeight: '800'
                                        }}>{unreadCount}</span>
                                    )}
                                </Link>
                            </>
                        )}
                        
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)', height: '24px', margin: '0 5px' }}></div>

                        <Link to="/lost-and-found" style={{ ...navLinkStyle, color: '#e879f9', fontWeight: '800' }}><ShieldAlert size={18} /> Recovery</Link>
                        
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
                                    color: 'white',
                                    transition: 'border-color 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                                >
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
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#ef4444';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.color = '#ef4444';
                            }}
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: '#f8fafc', fontWeight: '600' }}>Login</Link>
                        <Link to="/register" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Get Started <ChevronRight size={18} />
                        </Link>
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
