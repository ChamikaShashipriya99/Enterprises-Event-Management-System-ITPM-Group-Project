import axios from 'axios';

const API_USER_URL = 'http://localhost:5000/api/users/';
const API_ADMIN_URL = 'http://localhost:5000/api/admin/';

// Get user profile
const getProfile = async (token) => {
    const response = await axios.get(API_USER_URL + 'profile', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Update user profile
const updateProfile = async (userData, token) => {
    const response = await axios.put(API_USER_URL + 'profile', userData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Delete user account
const deleteAccount = async (token) => {
    const response = await axios.delete(API_USER_URL + 'profile', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Admin: Get all users
const getAllUsers = async (token) => {
    const response = await axios.get(API_ADMIN_URL + 'users', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Admin: Delete user
const adminDeleteUser = async (id, token) => {
    const response = await axios.delete(API_ADMIN_URL + `users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Admin: Get stats
const getUserStats = async (token) => {
    const response = await axios.get(API_ADMIN_URL + 'user-stats', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Upload profile picture
const uploadImage = async (formData, token) => {
    const response = await axios.post(API_USER_URL + 'upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

const userService = {
    getProfile,
    updateProfile,
    deleteAccount,
    getAllUsers,
    adminDeleteUser,
    getUserStats,
    uploadImage
};

export default userService;
