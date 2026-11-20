import express from "express";
import {
  register,
  login,
  getProfile,
} from "../controllers/authController.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Protected Profile
router.get("/profile", protect, getProfile);

export default router;
