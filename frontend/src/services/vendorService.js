// frontend/src/services/vendorService.js
import axios from 'axios';

const BASE = 'http://localhost:5000/api/vendors';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const vendorService = {
  getAll: () =>
    axios.get(BASE, { headers: getAuthHeader() }),

  create: (data) =>
    axios.post(BASE, data, { headers: getAuthHeader() }),

  update: (id, data) =>
    axios.put(`${BASE}/${id}`, data, { headers: getAuthHeader() }),

  remove: (id) =>
    axios.delete(`${BASE}/${id}`, { headers: getAuthHeader() }),
};

export default vendorService;
