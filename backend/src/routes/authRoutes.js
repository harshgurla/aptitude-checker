import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);

export default router;
