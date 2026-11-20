import { z } from 'zod';
import categories from '../constants/categories.js';

const transactionFields = {
  title: z.string().trim().min(2).max(100),
  amount: z.coerce.number().finite(),
  type: z.enum(['income', 'expense']),
  category: z.string().trim().min(2).max(40),
  date: z.coerce.date().optional()
};

const checkTransaction = (transaction, context) => {
  if (transaction.type === 'income' && transaction.amount <= 0) {
    context.addIssue({
      code: 'custom',
      path: ['amount'],
      message: 'Income amount must be greater than zero.'
    });
  }

  if (transaction.type === 'expense' && transaction.amount >= 0) {
    context.addIssue({
      code: 'custom',
      path: ['amount'],
      message: 'Expense amount must be less than zero.'
    });
  }

  const allowedCategories = categories[transaction.type];
  if (!allowedCategories.includes(transaction.category)) {
    context.addIssue({
      code: 'custom',
      path: ['category'],
      message: `Choose a valid category for ${transaction.type}.`
    });
  }
};

export const transactionBodySchema = z.object(transactionFields).superRefine(checkTransaction);

export const transactionIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid transaction ID.')
});

export const transactionQuerySchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().trim().min(1).max(40).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
}).superRefine((query, context) => {
  if (query.startDate && query.endDate && query.startDate > query.endDate) {
    context.addIssue({
      code: 'custom',
      path: ['endDate'],
      message: 'endDate must be on or after startDate.'
    });
  }
});

export const monthlySummaryQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must use YYYY-MM format.').optional()
});
