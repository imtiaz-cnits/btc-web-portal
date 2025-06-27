import axios from 'axios';

const api = axios.create({
    baseURL: 'https://egpbtc.com/api',
    withCredentials: true,
});

export default api;