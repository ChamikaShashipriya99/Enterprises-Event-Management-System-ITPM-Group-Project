import { useState, useEffect, useRef } from 'react';

const NotificationDropdown = ({ currentUser }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const token = localStorage.getItem('token') || (currentUser && currentUser.token) || '';
    const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${apiUrl}/api/notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        if (currentUser) {
            fetchNotifications();
            // Automatically poll for new notifications every 60 seconds
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [currentUser, token, apiUrl]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await fetch(`${apiUrl}/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#f8fafc',
                    fontSize: '1.2rem',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '5px'
                }}
                title="Notifications"
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '0.6rem',
                        fontWeight: 'bold',
                        borderRadius: '50%',
                        padding: '2px 5px',
                        minWidth: '15px',
                        textAlign: 'center'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    width: '320px',
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                    zIndex: 1000,
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}>
                    <div style={{ padding: '10px 15px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 'bold', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Notifications</span>
                        {unreadCount > 0 && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{unreadCount} New</span>}
                    </div>
                    {notifications.length === 0 ? (
                        <div style={{ padding: '15px', color: '#94a3b8', textAlign: 'center', fontSize: '0.85rem' }}>
                            You're all caught up!
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <div 
                                key={notification._id}
                                onClick={() => !notification.isRead && markAsRead(notification._id)}
                                style={{
                                    padding: '12px 15px',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                    cursor: notification.isRead ? 'default' : 'pointer',
                                    background: notification.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.1)',
                                    transition: 'background 0.2s',
                                    color: notification.isRead ? '#94a3b8' : '#f8fafc',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '5px'
                                }}
                            >
                                <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                                    {notification.message}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                    {new Date(notification.createdAt).toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
