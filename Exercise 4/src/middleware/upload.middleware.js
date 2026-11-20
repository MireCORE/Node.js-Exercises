import multer from 'multer';
import AppError from '../utils/AppError.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },
  fileFilter(_req, file, callback) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new AppError('Only JPG, PNG, WEBP or GIF images are allowed.', 400));
    }

    callback(null, true);
  }
});

export default upload;
