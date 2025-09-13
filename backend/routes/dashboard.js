const express = require('express');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

const router = express.Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate date ranges
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    const startOfYear = new Date(currentYear, 0, 1);

    // Get all transactions for calculations
    const [
      totalIncomeResult,
      totalExpensesResult,
      monthlyIncomeResult,
      monthlyExpensesResult,
      categoryBreakdown,
      monthlyTrends
    ] = await Promise.all([
      // Total income (all time)
      Transaction.aggregate([
        { $match: { type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),

      // Total expenses (all time)
      Transaction.aggregate([
        { $match: { type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),

      // Monthly income
      Transaction.aggregate([
        { 
          $match: { 
            type: 'income',
            date: { $gte: startOfMonth, $lte: endOfMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),

      // Monthly expenses
      Transaction.aggregate([
        { 
          $match: { 
            type: 'expense',
            date: { $gte: startOfMonth, $lte: endOfMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),

      // Category breakdown (current month expenses)
      Transaction.aggregate([
        { 
          $match: { 
            type: 'expense',
            date: { $gte: startOfMonth, $lte: endOfMonth }
          } 
        },
        {
          $group: {
            _id: '$category',
            amount: { $sum: '$amount' }
          }
        },
        { $sort: { amount: -1 } }
      ]),

      // Monthly trends (last 6 months)
      getMonthlyTrends(6)
    ]);

    // Extract values with defaults
    const totalIncome = totalIncomeResult[0]?.total || 0;
    const totalExpenses = totalExpensesResult[0]?.total || 0;
    const monthlyIncome = monthlyIncomeResult[0]?.total || 0;
    const monthlyExpenses = monthlyExpensesResult[0]?.total || 0;

    // Calculate balance
    const balance = totalIncome - totalExpenses;

    // Calculate category percentages
    const totalCategorySpending = categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0);
    const categoryBreakdownWithPercentages = categoryBreakdown.map(cat => ({
      category: cat._id,
      amount: cat.amount,
      percentage: totalCategorySpending > 0 ? Math.round((cat.amount / totalCategorySpending) * 100 * 100) / 100 : 0
    }));

    const stats = {
      totalIncome,
      totalExpenses,
      balance,
      monthlyIncome,
      monthlyExpenses,
      categoryBreakdown: categoryBreakdownWithPercentages,
      monthlyTrends
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
});

// GET /api/dashboard/summary - Get summary for specific period
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const [incomeResult, expensesResult, transactionCount] = await Promise.all([
      Transaction.aggregate([
        { 
          $match: { 
            type: 'income',
            date: { $gte: start, $lte: end }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),

      Transaction.aggregate([
        { 
          $match: { 
            type: 'expense',
            date: { $gte: start, $lte: end }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),

      Transaction.countDocuments({
        date: { $gte: start, $lte: end }
      })
    ]);

    const income = incomeResult[0]?.total || 0;
    const expenses = expensesResult[0]?.total || 0;

    res.json({
      period: { startDate, endDate },
      totalIncome: income,
      totalExpenses: expenses,
      netSavings: income - expenses,
      transactionCount
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ message: 'Error fetching dashboard summary', error: error.message });
  }
});

// Helper function to get monthly trends
async function getMonthlyTrends(monthsBack = 6) {
  const trends = [];
  const now = new Date();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    const [incomeResult, expensesResult] = await Promise.all([
      Transaction.aggregate([
        { 
          $match: { 
            type: 'income',
            date: { $gte: startOfMonth, $lte: endOfMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),

      Transaction.aggregate([
        { 
          $match: { 
            type: 'expense',
            date: { $gte: startOfMonth, $lte: endOfMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const income = incomeResult[0]?.total || 0;
    const expenses = expensesResult[0]?.total || 0;

    trends.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      income,
      expenses,
      savings: income - expenses
    });
  }

  return trends;
}

module.exports = router;