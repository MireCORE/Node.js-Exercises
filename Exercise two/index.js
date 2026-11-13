require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const booksRoutes = require("./routes/books");

const app = express();

app.use(express.json());

// Books Routes
app.use("/books", booksRoutes);

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
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  }
};

startServer();
