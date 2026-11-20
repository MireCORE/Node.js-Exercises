import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

export const getAdminOverview = async (_req, res) => {
  const [totalUsers, totalTransactions, totals, topSpendingCategories] = await Promise.all([
    User.countDocuments(),
    Transaction.countDocuments(),
    Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          total: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'expense'] },
                { $multiply: ['$amount', -1] },
                '$amount'
              ]
            }
          }
        }
      }
    ]),
    Transaction.aggregate([
      { $match: { type: 'expense' } },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: { $multiply: ['$amount', -1] } },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalSpent: 1,
          transactionCount: 1
        }
      }
    ])
  ]);

  const totalIncome = totals.find((item) => item._id === 'income')?.total || 0;
  const totalExpenses = totals.find((item) => item._id === 'expense')?.total || 0;

  res.status(200).json({
    status: 'success',
    data: {
      totalUsers,
      totalTransactions,
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      topSpendingCategories
    }
  });
};
