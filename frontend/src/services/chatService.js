import axios from 'axios';

const API_URL = 'http://localhost:5000/api/chat/';

const fetchChats = async (token) => {
    const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

const accessChat = async (userId, token) => {
    const response = await axios.post(
        API_URL,
        { userId },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data;
};

const searchUsers = async (query, token) => {
    const response = await axios.get(`${API_URL}users?search=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

const sendMessage = async (content, chatId, token) => {
    const response = await axios.post(
        `${API_URL}message`,
        { content, chatId },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data;
};

const fetchMessages = async (chatId, token) => {
    const response = await axios.get(`${API_URL}message/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

const chatService = {
    fetchChats,
    accessChat,
    searchUsers,
    sendMessage,
    fetchMessages,
};

export default chatService;
