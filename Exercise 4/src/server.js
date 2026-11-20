import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set and contain at least 32 characters.');
  }

  await connectDB();
  configureCloudinary();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs: ${process.env.API_BASE_URL || `http://localhost:${PORT}`}/docs`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
