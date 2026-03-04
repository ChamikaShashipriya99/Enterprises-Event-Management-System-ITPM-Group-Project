import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (userData) => {
        const data = await authService.login(userData);
        setUser(data);
    };

    const register = async (userData) => {
        const data = await authService.register(userData);
        setUser(data);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        currentUser: user,
        setUser,
        token: user?.token || null,
        role: user?.role || null,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
