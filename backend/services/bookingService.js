import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return {
        headers: {
            Authorization: `Bearer ${user?.token}`
        }
    };
};

// Check seat availability for an event
const checkAvailability = async (eventId) => {
    const response = await axios.get(`${API_URL}/bookings/availability/${eventId}`, getAuthHeader());
    return response.data;
};

// Create a new booking
const createBooking = async (eventId) => {
    const response = await axios.post(`${API_URL}/bookings`, { eventId }, getAuthHeader());
    return response.data;
};

// Get all bookings for logged-in student
const getMyBookings = async () => {
    const response = await axios.get(`${API_URL}/bookings/my-bookings`, getAuthHeader());
    return response.data;
};

// Get a single booking by bookingId
const getBookingById = async (bookingId) => {
    const response = await axios.get(`${API_URL}/bookings/${bookingId}`, getAuthHeader());
    return response.data;
};

// Cancel a booking
const cancelBooking = async (bookingId, reason = '') => {
    const response = await axios.put(
        `${API_URL}/bookings/${bookingId}/cancel`,
        { reason },
        getAuthHeader()
    );
    return response.data;
};

// QR Check-in (organizer/admin)
const checkIn = async (qrCodeData) => {
    const response = await axios.post(`${API_URL}/bookings/checkin`, { qrCodeData }, getAuthHeader());
    return response.data;
};

// Generate certificate for an attended booking
const generateCertificate = async (bookingId, sendEmail = false) => {
    const response = await axios.post(
        `${API_URL}/bookings/${bookingId}/certificate`,
        { sendEmail },
        getAuthHeader()
    );
    return response.data;
};

// Download certificate PDF
const downloadCertificate = async (certificateId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await axios.get(
        `${API_URL}/bookings/certificate/download/${certificateId}`,
        {
            headers: { Authorization: `Bearer ${user?.token}` },
            responseType: 'blob'
        }
    );
    return response.data;
};

// Admin: Get all bookings
const getAllBookings = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(
        `${API_URL}/admin/bookings${params ? `?${params}` : ''}`,
        getAuthHeader()
    );
    return response.data;
};

// Admin: Get booking stats
const getBookingStats = async () => {
    const response = await axios.get(`${API_URL}/admin/bookings/stats`, getAuthHeader());
    return response.data;
};

const bookingService = {
    checkAvailability,
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    checkIn,
    generateCertificate,
    downloadCertificate,
    getAllBookings,
    getBookingStats
};

export default bookingService;
