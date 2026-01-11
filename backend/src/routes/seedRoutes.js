import express from 'express';
import { seedIfEmpty } from '../seeds/seedHelper.js';

const router = express.Router();

// Public endpoint for initial deployment seeding
router.get('/', async (req, res, next) => {
  try {
    const result = await seedIfEmpty();
    const status = result.seeded ? 200 : 409; // 409 Conflict when already seeded
    res.status(status).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
