import "dotenv/config";

import express from "express";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.use(express.json({ limit: "10kb" }));

// Authentication Routes
app.use("/auth", authRoutes);

// Admin Routes
app.use("/admin", adminRoutes);

// Not Found
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      message: "Invalid JSON body",
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: "Email is already registered",
    });
  }

  if (err.name === "ValidationError" || err.name === "CastError") {
    return res.status(400).json({
      message: err.message,
    });
  }

  res.status(500).json({
    message: "Internal server error",
  });
});

// Start Server
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
      throw new Error("MONGO_URI and JWT_SECRET must be configured");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
