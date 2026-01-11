import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Service
export const authService = {
  register: (name, email, password, confirmPassword) =>
    api.post('/auth/register', { name, email, password, confirmPassword }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (name, avatar) => api.put('/auth/profile', { name, avatar }),
};

// Test Service
export const testService = {
  startTest: () => api.post('/test/start'),
  submitTest: (testId, answers) => api.post('/test/submit', { testId, answers }),
  getTestResult: (testId) => api.get(`/test/result/${testId}`),
  getTestHistory: (limit = 10, skip = 0) =>
    api.get(`/test/history?limit=${limit}&skip=${skip}`),
  getTestStatus: (testId) => api.get(`/test/status/${testId}`),
};

// Dashboard Service
export const dashboardService = {
  getTodayTopic: () => api.get('/dashboard/today-topic'),
  getLeaderboard: () => api.get('/dashboard/leaderboard'),
  getUserRank: () => api.get('/dashboard/my-rank'),
  getAllTopics: () => api.get('/dashboard/all-topics'),
  getScheduleInfo: () => api.get('/dashboard/schedule'),
};

// Admin Service
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllStudents: (skip = 0, limit = 20) =>
    api.get(`/admin/students?skip=${skip}&limit=${limit}`),
  getStudentDetails: (studentId) => api.get(`/admin/student/${studentId}`),
  pauseStudentTests: (studentId, durationDays = 7) =>
    api.post(`/admin/student/${studentId}/pause`, { durationDays }),
  resumeStudentTests: (studentId) => api.post(`/admin/student/${studentId}/resume`),
  toggleStudentActive: (studentId) => api.post(`/admin/student/${studentId}/toggle`),
  resetLeaderboard: () => api.post('/admin/leaderboard/reset', { confirm: true }),
  getAnalytics: (studentId) =>
    api.get(`/admin/analytics${studentId ? `?studentId=${studentId}` : ''}`),
  // Question generation and topic management
  generateQuestions: () => api.post('/admin/generate-questions'),
  rotateTopic: () => api.post('/admin/rotate-topic'),
  getTodayTopicInfo: () => api.get('/admin/today-topic'),
};

export default api;
