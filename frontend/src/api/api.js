import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getAllUsers = () => API.get('/auth/users');
export const deleteUser = (id) => API.delete(`/auth/users/${id}`);

// Quizzes
export const getQuizzes = (params) => API.get('/quizzes/', { params });
export const getQuiz = (id) => API.get(`/quizzes/${id}`);
export const createQuiz = (data) => API.post('/quizzes/', data);
export const deleteQuiz = (id) => API.delete(`/quizzes/${id}`);
export const submitQuiz = (data) => API.post('/quizzes/submit', data);
export const getUserAttempts = (userId) => API.get(`/quizzes/attempts/${userId}`);
export const getSubjects = () => API.get('/quizzes/subjects');

// Results
export const getLeaderboard = () => API.get('/results/leaderboard');
export const getUserPerformance = (userId) => API.get(`/results/performance/${userId}`);
export const getClassPerformance = (teacherId) => API.get(`/results/class/${teacherId}`);

// AI
export const getRecommendations = (userId) => API.get(`/ai/recommendations/${userId}`);
export const getClusters = () => API.get('/ai/clusters');
