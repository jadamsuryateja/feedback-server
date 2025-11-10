import express from 'express';
import {
  createConfig,
  getConfigs,
  getConfigByTitle,
  updateConfig,
  deleteConfig
} from '../controllers/configController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('admin', 'coordinator', 'bsh'), createConfig);
router.get('/', authenticate, authorize('admin', 'coordinator', 'bsh'), getConfigs);
router.get('/title/:title', getConfigByTitle);
router.put('/:id', authenticate, authorize('admin', 'coordinator', 'bsh'), updateConfig);
router.delete('/:id', authenticate, authorize('admin'), deleteConfig);

export default router;
