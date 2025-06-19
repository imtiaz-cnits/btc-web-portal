import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api', // Your backend API URL
    withCredentials: true, // Include cookies in requests
});

export default api;