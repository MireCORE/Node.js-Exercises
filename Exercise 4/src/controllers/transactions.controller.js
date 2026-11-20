import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import AppError from '../utils/AppError.js';

export const createTransaction = async (req, res) => {
  const transaction = await Transaction.create({
    ...req.validated.body,
    user: req.user._id
  });

  res.status(201).json({
    status: 'success',
    data: { transaction }
  });
};

export const getTransactions = async (req, res) => {
  const { type, category, startDate, endDate, page, limit } = req.validated.query;
  const filter = { user: req.user._id };

  if (type) filter.type = type;
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = startDate;
    if (endDate) {
      // endDate is inclusive: include every transaction through the end of that UTC day.
      const exclusiveEndDate = new Date(endDate);
      exclusiveEndDate.setUTCDate(exclusiveEndDate.getUTCDate() + 1);
      filter.date.$lt = exclusiveEndDate;
    }
  }

  const skip = (page - 1) * limit;
  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit),
    Transaction.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    results: transactions.length,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    data: { transactions }
  });
};

export const getMonthlySummary = async (req, res) => {
  const month = req.validated.query.month || new Date().toISOString().slice(0, 7);
  const [year, monthNumber] = month.split('-').map(Number);
  const startDate = new Date(Date.UTC(year, monthNumber - 1, 1));
  const endDate = new Date(Date.UTC(year, monthNumber, 1));

  const categoryBreakdown = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
        date: { $gte: startDate, $lt: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        income: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
        },
        expenses: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, { $multiply: ['$amount', -1] }, 0] }
        },
        transactionCount: { $sum: 1 }
      }
    },
    { $sort: { expenses: -1, income: -1, _id: 1 } },
    {
      $project: {
        _id: 0,
        category: '$_id',
        income: 1,
        expenses: 1,
        transactionCount: 1
      }
    }
  ]);

  const totalIncome = categoryBreakdown.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = categoryBreakdown.reduce((sum, item) => sum + item.expenses, 0);

  res.status(200).json({
    status: 'success',
    data: {
      month,
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      categoryBreakdown
    }
  });
};

export const updateTransaction = async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!transaction) throw new AppError('Transaction not found.', 404);

  const updates = Object.fromEntries(
    Object.entries(req.validated.body).filter(([, value]) => value !== undefined)
  );
  transaction.set(updates);
  await transaction.save();

  res.status(200).json({
    status: 'success',
    data: { transaction }
  });
};

export const deleteTransaction = async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!transaction) throw new AppError('Transaction not found.', 404);

  res.status(200).json({
    status: 'success',
    message: 'Transaction deleted successfully.'
  });
};
