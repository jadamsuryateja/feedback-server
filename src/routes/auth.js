import express from 'express';
import { login, verify } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/verify', authenticate, verify);

// Add this only in development
if (process.env.NODE_ENV === 'development') {
  router.get('/debug-credentials', (req, res) => {
    res.json({
      adminUser: {
        username: credentials.admin.username,
        hashPrefix: credentials.admin.password.substring(0, 10) + '...',
        hashLength: credentials.admin.password.length,
        role: credentials.admin.role
      }
    });
  });
}

export default router;
