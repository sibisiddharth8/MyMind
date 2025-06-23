import axios from 'axios';

// The base Axios instance for all API calls.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default apiClient;