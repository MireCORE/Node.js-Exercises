import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

const protect = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      return next(new AppError('Authentication required. Provide a Bearer token.', 401));
    }

    const token = authorization.split(' ')[1];
    if (!token) return next(new AppError('Authentication token is missing.', 401));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return next(new AppError('The user for this token no longer exists.', 401));

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }

    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid authentication token.', 401));
    }

    next(error);
  }
};

export default protect;
