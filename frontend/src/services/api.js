import axios from 'axios';

const api = axios.create({
  baseURL: 'https://synclearn-backend.vercel.app/api'
});

export default api;
