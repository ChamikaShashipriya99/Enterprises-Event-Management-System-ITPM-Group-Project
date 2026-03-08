import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

// Register user
const register = async (userData) => {
    const response = await axios.post(API_URL + 'register', userData);
    return response.data;
};

// Login user
const login = async (userData) => {
    const response = await axios.post(API_URL + 'login', userData);
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

// Logout user
const logout = () => {
    localStorage.removeItem('user');
};

const getProfile = async (token) => {
    const response = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data) {
        const userData = { ...response.data, token };
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
    }
    return null;
};

const generateMfa = async (token) => {
    const response = await axios.post(API_URL + 'mfa/generate', {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const verifyMfaSetup = async (token, mfaCode) => {
    const response = await axios.post(API_URL + 'mfa/verify', { token: mfaCode }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const disableMfa = async (token) => {
    const response = await axios.post(API_URL + 'mfa/disable', {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const getSessions = async (token) => {
    const response = await axios.get(API_URL + 'sessions', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const revokeSession = async (token, sessionId) => {
    const response = await axios.delete(API_URL + `sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const logoutAllDevices = async (token) => {
    const response = await axios.delete(API_URL + 'sessions', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const authService = {
    register,
    login,
    logout,
    getProfile,
    generateMfa,
    verifyMfaSetup,
    disableMfa,
    getSessions,
    revokeSession,
    logoutAllDevices
};

export default authService;
