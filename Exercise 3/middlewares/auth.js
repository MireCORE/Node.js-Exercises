import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  const match = authHeader?.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({
      message: "Not authorized. Token required",
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(match[1], process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  try {
    if (typeof decoded !== "object" || !mongoose.isValidObjectId(decoded.id)) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export default protect;
