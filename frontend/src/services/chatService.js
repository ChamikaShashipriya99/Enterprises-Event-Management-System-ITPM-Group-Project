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

const sendMessage = async (content, chatId, token, fileUrl, fileType, isAnnouncement) => {
    const response = await axios.post(
        `${API_URL}message`,
        { content, chatId, fileUrl, fileType, isAnnouncement },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data;
};

const fetchMessages = async (chatId, token, page = 1) => {
    const response = await axios.get(`${API_URL}message/${chatId}?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

const accessGlobalChat = async (token) => {
    const response = await axios.get(`${API_URL}global`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

const uploadFile = async (formData, token) => {
    const response = await axios.post(`${API_URL}upload`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

const updateMessage = async (messageId, content, token) => {
    const response = await axios.put(
        `${API_URL}message/${messageId}`,
        { content },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data;
};

const deleteMessage = async (messageId, token) => {
    const response = await axios.delete(`${API_URL}message/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

const toggleReaction = async (messageId, emoji, token) => {
    const response = await axios.post(
        `${API_URL}message/${messageId}/react`,
        { emoji },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data;
};

const togglePinMessage = async (chatId, messageId, token) => {
    const response = await axios.post(
        `${API_URL}${chatId}/pin/${messageId}`,
        {},
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data;
};

const clearChat = async (chatId, token) => {
    const response = await axios.delete(
        `${API_URL}${chatId}/clear`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data;
};

const getAuditLogs = async (token) => {
    const response = await axios.get(`${API_URL}audit-logs`, {
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
    accessGlobalChat,
    uploadFile,
    updateMessage,
    deleteMessage,
    toggleReaction,
    togglePinMessage,
    clearChat,
    getAuditLogs,
};

export default chatService;
