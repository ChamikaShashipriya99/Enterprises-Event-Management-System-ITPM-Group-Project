import { useState, useContext } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    History, 
    MessageSquare, 
    ShieldAlert, 
    User, 
    LogOut, 
    ChevronLeft,
    Settings,
    Bell,
    PlusCircle,
    Search
} from 'lucide-react';
import EventBuddyLogo from '../assets/EventBuddy.png';
import './Sidebar.css';

const Sidebar = () => {
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const { currentUser, logout, unreadCount, systemUnreadCount } = useContext(AuthContext);
    const navigate = useNavigate();

    const menuItems = {
        admin: [
            { path: '/admin-dashboard', icon: <LayoutDashboard size={20} />, text: 'Dashboard' },
            { path: '/admin/users', icon: <Users size={20} />, text: 'User Management' },
            { path: '/admin/events', icon: <Calendar size={20} />, text: 'Event Oversight' },
            { path: '/admin/lost-found', icon: <ShieldAlert size={20} />, text: 'Recovery Hub' },
            { path: '/admin/audit-logs', icon: <History size={20} />, text: 'System Logs' },
            { path: '/chat', icon: <MessageSquare size={20} />, text: 'Messages', badge: unreadCount },
            { path: '/profile?tab=notifications', icon: <Bell size={20} />, text: 'Notifications', badge: systemUnreadCount },
        ],
        organizer: [
            { path: '/organizer-dashboard', icon: <LayoutDashboard size={20} />, text: 'Dashboard' },
            { path: '/organizer-events', icon: <Calendar size={20} />, text: 'My Events' },
            { path: '/create-event', icon: <PlusCircle size={20} />, text: 'Create Event' },
            { path: '/lost-and-found', icon: <ShieldAlert size={20} />, text: 'Recovery Hub' },
            { path: '/chat', icon: <MessageSquare size={20} />, text: 'Messages', badge: unreadCount },
            { path: '/profile?tab=notifications', icon: <Bell size={20} />, text: 'Notifications', badge: systemUnreadCount },
        ]
    };

    const currentItems = menuItems[currentUser?.role] || [];

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <aside className="sidebar-container">
                <div className="sidebar-header">
                    <Link to="/" className="sidebar-logo">
                        <img src={EventBuddyLogo} alt="EventBuddy" style={{ height: '35px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />
                    </Link>
                </div>

                <div className="sidebar-content">
                    {currentItems.map((item, index) => (
                        <NavLink 
                            key={index}
                            to={item.path} 
                            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                        >
                            <span className="sidebar-nav-link-icon">{item.icon}</span>
                            <span className="sidebar-nav-link-text">{item.text}</span>
                            {item.badge > 0 && (
                                <span style={{ 
                                    marginLeft: 'auto', 
                                    background: '#ef4444', 
                                    color: 'white', 
                                    fontSize: '0.7rem', 
                                    padding: '2px 6px', 
                                    borderRadius: '10px' 
                                }}>{item.badge}</span>
                            )}
                        </NavLink>
                    ))}
                </div>

                <div className="sidebar-footer">
                    <Link to="/profile" className="sidebar-user-info" style={{ textDecoration: 'none' }}>
                        <div className="sidebar-avatar">
                            {currentUser?.profilePicture ? (
                                <img src={currentUser.profilePicture.startsWith('http') ? currentUser.profilePicture : `http://localhost:5000${currentUser.profilePicture}`} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : currentUser?.name?.charAt(0)}
                        </div>
                        <div className="sidebar-user-details">
                            <div className="sidebar-username">{currentUser?.name}</div>
                            <div className="sidebar-userrole">{currentUser?.role}</div>
                        </div>
                    </Link>
                    <button className="sidebar-footer-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span className="sidebar-nav-link-text">Logout</span>
                    </button>
                </div>
            </aside>

            <ConfirmModal
                isOpen={isLogoutModalOpen}
                title="Confirm Logout"
                message="Are you sure you want to log out?"
                onConfirm={confirmLogout}
                onCancel={() => setIsLogoutModalOpen(false)}
                confirmText="Logout"
                type="danger"
            />
        </>
    );
};

export default Sidebar;
