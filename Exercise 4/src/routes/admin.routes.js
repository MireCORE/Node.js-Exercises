import { Router } from 'express';
import protect from '../middleware/auth.middleware.js';
import authorize from '../middleware/authorize.middleware.js';
import { getAdminOverview } from '../controllers/admin.controller.js';

const router = Router();
router.get('/overview', protect, authorize('admin'), getAdminOverview);

export default router;
