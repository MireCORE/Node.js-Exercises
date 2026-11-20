import express from "express";
const router = express.Router();

import protect from "../middlewares/auth.js";
import authorize from "../middlewares/authorize.js";
import getDashboard from "../controllers/adminController.js";

// Admin Dashboard
router.get("/dashboard", protect, authorize("admin"), getDashboard);

export default router;
