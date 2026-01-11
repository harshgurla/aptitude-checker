import express from 'express';
import {
  startTest,
  submitTest,
  getTestResult,
  getTestHistory,
  getTestStatus,
} from '../controllers/testController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/start', authMiddleware, roleMiddleware(['student']), startTest);
router.post('/submit', authMiddleware, roleMiddleware(['student']), submitTest);
router.get('/result/:testId', authMiddleware, getTestResult);
router.get('/history', authMiddleware, roleMiddleware(['student']), getTestHistory);
router.get('/status/:testId', authMiddleware, getTestStatus);

export default router;
