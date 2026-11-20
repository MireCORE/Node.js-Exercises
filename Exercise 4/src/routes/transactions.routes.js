import { Router } from 'express';
import protect from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  createTransaction,
  getTransactions,
  getMonthlySummary,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactions.controller.js';
import {
  transactionBodySchema,
  transactionIdSchema,
  transactionQuerySchema,
  monthlySummaryQuerySchema
} from '../schemas/transaction.schema.js';

const router = Router();

router.use(protect);
router.post('/', validate({ body: transactionBodySchema }), createTransaction);
router.get('/monthly-summary', validate({ query: monthlySummaryQuerySchema }), getMonthlySummary);
router.get('/', validate({ query: transactionQuerySchema }), getTransactions);
router.put('/:id', validate({ params: transactionIdSchema, body: transactionBodySchema }), updateTransaction);
router.delete('/:id', validate({ params: transactionIdSchema }), deleteTransaction);

export default router;
