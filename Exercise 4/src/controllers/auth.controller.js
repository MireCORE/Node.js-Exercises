import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { generateToken } from '../utils/generateToken.js';

export const register = async (req, res) => {
  const { name, email, password } = req.validated.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError('An account with this email already exists.', 409);

  // Role lagama qaato request-ka: user kasta oo isdiiwaangeliya wuxuu ku bilaabmaa role=user.
  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  res.status(201).json({
    status: 'success',
    message: 'Account created successfully.',
    token,
    data: { user }
  });
};

export const login = async (req, res) => {
  const { email, password } = req.validated.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = generateToken(user._id);
  user.password = undefined;

  res.status(200).json({
    status: 'success',
    message: 'Login successful.',
    token,
    data: { user }
  });
};

export const getProfile = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user }
  });
};
