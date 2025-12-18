import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Add auth token from storage to all requests
apiClient.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('public_token');
    if (!token) {
      token = sessionStorage.getItem('public_token');
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors - auto logout on token expiration
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if error is 401 (Unauthorized) - token expired or invalid
    if (error.response && error.response.status === 401) {
      // Clear auth data from both storages
      localStorage.removeItem('public_token');
      localStorage.removeItem('public_user');
      sessionStorage.removeItem('public_token');
      sessionStorage.removeItem('public_user');
      
      // Redirect to home page (public portfolio doesn't have login page)
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;