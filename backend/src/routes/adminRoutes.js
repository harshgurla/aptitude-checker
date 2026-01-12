import express from 'express';
import {
  getAllStudents,
  getStudentDetails,
  pauseStudentTests,
  resumeStudentTests,
  toggleStudentActive,
  resetLeaderboard,
  getAdminDashboard,
  getDetailedAnalytics,
  generateQuestionsManually,
  rotateTopic,
  getTodayTopicInfo,
} from '../controllers/adminController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { aiGenerationLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const adminOnly = [authMiddleware, roleMiddleware(['admin'])];

router.get('/dashboard', ...adminOnly, getAdminDashboard);
router.get('/students', ...adminOnly, getAllStudents);
router.get('/student/:studentId', ...adminOnly, getStudentDetails);
router.post('/student/:studentId/pause', ...adminOnly, pauseStudentTests);
router.post('/student/:studentId/resume', ...adminOnly, resumeStudentTests);
router.post('/student/:studentId/toggle', ...adminOnly, toggleStudentActive);
router.post('/leaderboard/reset', ...adminOnly, resetLeaderboard);
router.get('/analytics', ...adminOnly, getDetailedAnalytics);

// Question generation and topic management (with rate limiting)
router.post('/generate-questions', ...adminOnly, aiGenerationLimiter, generateQuestionsManually);
router.post('/rotate-topic', ...adminOnly, rotateTopic);
router.get('/today-topic', ...adminOnly, getTodayTopicInfo);

export default router;
