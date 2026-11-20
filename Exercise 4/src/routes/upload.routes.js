import { Router } from 'express';
import protect from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import { uploadProfilePicture } from '../controllers/upload.controller.js';

const router = Router();
router.post('/profile-picture', protect, upload.single('profilePicture'), uploadProfilePicture);

export default router;
