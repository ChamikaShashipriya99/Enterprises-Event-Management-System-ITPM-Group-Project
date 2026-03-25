import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import io from 'socket.io-client';

const ENDPOINT = "http://localhost:5000";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
        }
        setLoading(false);
    }, []);

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
        socket
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
