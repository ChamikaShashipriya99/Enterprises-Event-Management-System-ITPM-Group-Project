import { useState, useEffect, useRef, useContext } from 'react';
import { Bell } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = ({ currentUser }) => {
    const { 
        systemNotifications: notifications, 
        setSystemNotifications: setNotifications, 
        systemUnreadCount: unreadCount 
    } = useContext(AuthContext);
    
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const prevUnreadCountRef = useRef(0);
    const navigate = useNavigate();

    const token = localStorage.getItem('token') || (currentUser && currentUser.token) || '';
    const apiUrl = 'http://localhost:5000';

    const markAsRead = async (id) => {
        try {
            await fetch(`${apiUrl}/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Update context state
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (unreadCount > prevUnreadCountRef.current) {
            try {
                // Synthesize a crisp "Ping!" sound using Web Audio API (No MP3 file needed!)
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    const audioCtx = new AudioContext();
                    if (audioCtx.state === 'suspended') audioCtx.resume();
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Start at A5
                    oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); // Slide up to A6
                    
                    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05); // Fade in
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3); // Fade out quickly
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.3);
                }
            } catch (err) {
                console.log("Audio playback was blocked natively by browser policy");
            }
        }
        prevUnreadCountRef.current = unreadCount;
    }, [unreadCount]);

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
                <Bell size={20} />
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
                                onClick={() => {
                                    if (!notification.isRead) markAsRead(notification._id);
                                    if (notification.link) {
                                        navigate(notification.link);
                                        setIsOpen(false);
                                    }
                                }}
                                style={{
                                    padding: '12px 15px',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                    cursor: 'pointer',
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </div>
                                    {!notification.isRead && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notification._id);
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid rgba(99, 102, 241, 0.5)',
                                                color: '#6366f1',
                                                fontSize: '0.65rem',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                fontWeight: 'bold'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            Mark as Read
                                        </button>
                                    )}
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
