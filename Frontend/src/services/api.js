import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add authorization header
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

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthCheck = error.config.url.includes('/admin/profile') || error.config.url.includes('/dashboard');
      if (isAuthCheck && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

/* AUTH APIs */
export const authApi = {
  adminLogin: (data) => api.post('/auth/admin/login', data),
  internLogin: (data) => api.post('/auth/intern/login', data),
  internRegister: (data) => api.post('/auth/intern/register', data),
  getAdminProfile: () => api.get('/admin/profile'),
  changeAdminPassword: (data) => api.put('/admin/change-password', data),
};


/* INTERN APIs (Admin view) */
export const internApi = {
  getAll: () => api.get('/interns'),
  getById: (id) => api.get(`/interns/${id}`),
  create: (data) => api.post('/interns', data),
  update: (id, data) => api.put(`/interns/${id}`, data),
  resetPassword: (id, data) => api.put(`/interns/reset-password/${id}`, data),
  delete: (id) => api.delete(`/interns/${id}`),
};

/* STACK APIs */
export const stackApi = {
  getAll: () => api.get('/stacks'),
  getById: (id) => api.get(`/stacks/${id}`),
  create: (formData) => api.post('/stacks', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/stacks/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/stacks/${id}`),
};

/* MODULE APIs */
export const moduleApi = {
  getAll: () => api.get('/modules'),
  getByStack: (stackId) => api.get(`/modules/stack/${stackId}`),
  getById: (id) => api.get(`/modules/${id}`),
  create: (data) => api.post('/modules', data),
  update: (id, data) => api.put(`/modules/${id}`, data),
  delete: (id) => api.delete(`/modules/${id}`),
};

/* TOPIC APIs */
export const topicApi = {
  getAll: () => api.get('/topics'),
  getByModule: (moduleId) => api.get(`/topics/module/${moduleId}`),
  getById: (id) => api.get(`/topics/${id}`),
  create: (data) => api.post('/topics', data),
  update: (id, data) => api.put(`/topics/${id}`, data),
  delete: (id) => api.delete(`/topics/${id}`),
};

/* NOTE APIs */
export const noteApi = {
  getAll: () => api.get('/notes'),
  getByTopic: (topicId) => api.get(`/notes/topic/${topicId}`),
  getById: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

/* PROGRESS APIs */
export const progressApi = {
  markComplete: (topicId) => api.post('/progress/complete', { topicId }),
  markIncomplete: (topicId) => api.post('/progress/incomplete', { topicId }),
  getInternProgress: () => api.get('/progress'),
  getTopicProgress: (topicId) => api.get(`/progress/topic/${topicId}`),
  getSummary: () => api.get('/progress/summary'),
  getInternProgressById: (internId) => api.get(`/progress/intern/${internId}`),
};

/* BOOKMARK APIs */
export const bookmarkApi = {
  add: (topicId) => api.post('/bookmarks', { topicId }),
  getAll: () => api.get('/bookmarks'),
  check: (topicId) => api.get(`/bookmarks/check/${topicId}`),
  removeByTopic: (topicId) => api.delete(`/bookmarks/topic/${topicId}`),
  remove: (id) => api.delete(`/bookmarks/${id}`),
};

/* DASHBOARD APIs */
export const dashboardApi = {
  getAdminStats: () => api.get('/dashboard/admin'),
  getInternStats: () => api.get('/dashboard/intern'),
};

export default api;
