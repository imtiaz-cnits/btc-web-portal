import axios from 'axios';

const api = axios.create({
    baseURL: 'https://egpbtc.com/api', // http://localhost:3001/api
    withCredentials: true,
});

export default api;