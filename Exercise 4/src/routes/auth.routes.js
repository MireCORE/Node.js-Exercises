import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller.js';
import protect from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { authLimiter } from '../middleware/rate-limit.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), register);
router.post('/login', authLimiter, validate({ body: loginSchema }), login);
router.get('/profile', protect, getProfile);

export default router;
