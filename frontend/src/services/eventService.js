import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

const createEvent = async (eventData) => {
    const response = await axios.post(`${API_URL}/events`, eventData, getAuthHeader());
    return response.data;
};

const getMyEvents = async () => {
    const response = await axios.get(`${API_URL}/events/my-events`, getAuthHeader());
    return response.data;
};

const updateEvent = async (id, eventData) => {
    const response = await axios.put(`${API_URL}/events/${id}`, eventData, getAuthHeader());
    return response.data;
};

const deleteEvent = async (id) => {
    const response = await axios.delete(`${API_URL}/events/${id}`, getAuthHeader());
    return response.data;
};

const getAllEvents = async () => {
    const response = await axios.get(`${API_URL}/events`, getAuthHeader());
    return response.data;
};

const getEventById = async (id) => {
    const response = await axios.get(`${API_URL}/events/${id}`, getAuthHeader());
    return response.data;
};

const registerForEvent = async (id) => {
    const response = await axios.post(`${API_URL}/events/${id}/register`, {}, getAuthHeader());
    return response.data;
};

const unregisterFromEvent = async (id) => {
    const response = await axios.post(`${API_URL}/events/${id}/unregister`, {}, getAuthHeader());
    return response.data;
};

const getAdminEvents = async () => {
    const response = await axios.get(`${API_URL}/admin/events`, getAuthHeader());
    return response.data;
};

const getAdminStats = async () => {
    const response = await axios.get(`${API_URL}/admin/stats`, getAuthHeader());
    return response.data;
};

const eventService = {
    createEvent,
    getMyEvents,
    updateEvent,
    deleteEvent,
    getAllEvents,
    getEventById,
    registerForEvent,
    unregisterFromEvent,
    getAdminEvents,
    getAdminStats
};

export default eventService;
