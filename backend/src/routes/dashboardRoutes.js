import express from 'express';
import {
  getTodayTopicAndStatus,
  getLeaderboardTop10,
  getUserLeaderboardRank,
  getAllTopics,
  getScheduleInfo,
} from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/today-topic', getTodayTopicAndStatus);
router.get('/leaderboard', getLeaderboardTop10);
router.get('/my-rank', authMiddleware, getUserLeaderboardRank);
router.get('/all-topics', getAllTopics);
router.get('/schedule', getScheduleInfo);

export default router;
