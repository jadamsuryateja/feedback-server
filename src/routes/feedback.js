import express from 'express';
import {
  submitFeedback,
  getFeedbackSummary,
  getFeedbackResponses
} from '../controllers/feedbackController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/submit', submitFeedback);
router.get('/summary', authenticate, authorize('admin'), getFeedbackSummary);
router.get('/responses', authenticate, authorize('admin'), getFeedbackResponses);

export default router;
