import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import swaggerSpec from './docs/swagger.js';
import AppError from './utils/AppError.js';
import authRoutes from './routes/auth.routes.js';
import transactionRoutes from './routes/transactions.routes.js';
import categoryRoutes from './routes/categories.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { apiLimiter } from './middleware/rate-limit.middleware.js';
import requestLogger from './middleware/logger.middleware.js';
import notFound from './middleware/not-found.middleware.js';
import errorHandler from './middleware/error.middleware.js';

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim());

app.use(helmet());
app.use(cors({
  origin: allowedOrigins.includes('*')
    ? '*'
    : (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new AppError('This origin is not allowed by CORS.', 403));
      },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Personal Finance Tracker API is healthy.',
    timestamp: new Date().toISOString()
  });
});

app.get('/docs.json', (_req, res) => res.json(swaggerSpec));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'Personal Finance Tracker API Docs'
}));

app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
