 // frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login if token expired or invalid
      if (error.response.data.msg === 'Token has expired' || 
          error.response.data.msg === 'Invalid token') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

export const applicationService = {
  getApplications: (filters) => api.get('/applications', { params: filters }),
  getApplication: (id) => api.get(`/applications/${id}`),
  createApplication: (data) => api.post('/applications', data),
  updateApplication: (id, data) => api.put(`/applications/${id}`, data),
  deleteApplication: (id) => api.delete(`/applications/${id}`),
};

export const votingService = {
  getProposals: () => api.get('/voting/proposals'),
  getProposal: (id) => api.get(`/voting/proposals/${id}`),
  createProposal: (data) => api.post('/voting/proposals', data),
  vote: (proposalId, vote) => api.post(`/voting/vote`, { proposal_id: proposalId, vote }),
};

export const transactionService = {
  getTransactions: () => api.get('/transactions'),
  getTransaction: (id) => api.get(`/transactions/${id}`),
  executeTransaction: (data) => api.post('/transactions/execute', data),
};

export default api;
