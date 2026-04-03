// frontend/src/services/pointService.js
import axios from 'axios';

const BASE = 'http://localhost:5000/api/points';

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const pointService = {
    getMyPoints: () =>
        axios.get(`${BASE}/my-points`, { headers: getAuthHeader() }),
};

export default pointService;
