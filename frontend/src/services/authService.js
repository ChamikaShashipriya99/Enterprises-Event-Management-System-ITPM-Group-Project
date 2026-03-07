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

const authService = {
    register,
    login,
    logout,
    getProfile
};

export default authService;
