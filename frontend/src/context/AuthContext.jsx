import { createContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import authService from '../services/authService';
import chatService from '../services/chatService';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const ENDPOINT = "http://localhost:5000";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            
            // Request Notification Permission
            if (Notification.permission !== 'granted') {
                Notification.requestPermission();
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const fetchInitialUnreadCount = async () => {
            if (user?.token && location.pathname !== '/chat') {
                try {
                    const chats = await chatService.fetchChats(user.token);
                    const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
                    setUnreadCount(totalUnread);
                } catch (error) {
                    console.error("Error fetching unread count", error);
                }
            } else if (location.pathname === '/chat') {
                setUnreadCount(0);
            }
        };
        fetchInitialUnreadCount();
    }, [user, location.pathname]);

    useEffect(() => {
        if (user) {
            const newSocket = io(ENDPOINT, {
                transports: ['websocket'],
                upgrade: false
            });
            newSocket.emit("setup", user);
            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            setSocket(null);
        }
    }, [user]);

    // Notification listener - depends on socket and location
    useEffect(() => {
        if (!socket) return;

        const messageReceivedHandler = (newMessage) => {
            const isOnChatPage = window.location.pathname === '/chat';
            
            if (!isOnChatPage) {
                setUnreadCount(prev => prev + 1);
                // Show Toast
                toast(`New message from ${newMessage.sender.name}`, {
                    icon: '💬',
                    duration: 4000,
                    onClick: () => window.location.href = '/chat'
                });

                // Show Browser Notification
                if (Notification.permission === 'granted') {
                    new Notification(`EventBuddy - ${newMessage.sender.name}`, {
                        body: newMessage.content || 'Sent an attachment',
                        icon: '/favicon.ico'
                    });
                }
            }
        };

        socket.on("message-received", messageReceivedHandler);

        return () => {
            socket.off("message-received", messageReceivedHandler);
        };
    }, [socket, location.pathname]);

    const login = async (userData) => {
        const data = await authService.login(userData);
        if (!data.mfaRequired) {
            setUser(data);
        }
        return data;
    };

    const register = async (userData) => {
        const data = await authService.register(userData);
        return data;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const refreshProfile = async () => {
        if (user?.token) {
            const updatedUser = await authService.getProfile(user.token);
            setUser(updatedUser);
        }
    };

    const value = {
        currentUser: user,
        setUser,
        token: user?.token || null,
        role: user?.role || null,
        login,
        register,
        logout,
        refreshProfile,
        loading,
        socket,
        unreadCount,
        setUnreadCount
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
