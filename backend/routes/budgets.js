const express = require('express');
const { body, validationResult } = require('express-validator');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Validation middleware
const validateBudget = [
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('budgetAmount').isFloat({ min: 0 }).withMessage('Budget amount must be a positive number'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2020 }).withMessage('Year must be valid'),
  body('alertThreshold').optional().isFloat({ min: 0, max: 100 }).withMessage('Alert threshold must be between 0 and 100')
];

// GET /api/budgets - Get all budgets
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = {};

    // Default to current month/year if not specified
    const now = new Date();
    if (month) query.month = parseInt(month);
    else query.month = now.getMonth() + 1;
    
    if (year) query.year = parseInt(year);
    else query.year = now.getFullYear();

    const budgets = await Budget.find(query).sort({ category: 1 });
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Error fetching budgets', error: error.message });
  }
});

// GET /api/budgets/:id - Get budget by ID
router.get('/:id', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ message: 'Error fetching budget', error: error.message });
  }
});

// POST /api/budgets - Create new budget
router.post('/', validateBudget, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if budget already exists for this category/month/year
    const existingBudget = await Budget.findOne({
      category: req.body.category,
      month: req.body.month,
      year: req.body.year
    });

    if (existingBudget) {
      return res.status(400).json({ message: 'Budget already exists for this category and month' });
    }

    const budget = new Budget(req.body);
    
    // Calculate spent amount from existing transactions
    await calculateSpentAmount(budget);
    
    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ message: 'Error creating budget', error: error.message });
  }
});

// PUT /api/budgets/:id - Update budget
router.put('/:id', validateBudget, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Recalculate spent amount
    await calculateSpentAmount(budget);
    await budget.save();

    res.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ message: 'Error updating budget', error: error.message });
  }
});

// DELETE /api/budgets/:id - Delete budget
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ message: 'Error deleting budget', error: error.message });
  }
});

// GET /api/budgets/alerts/current - Get current budget alerts
router.get('/alerts/current', async (req, res) => {
  try {
    const now = new Date();
    const budgets = await Budget.find({
      month: now.getMonth() + 1,
      year: now.getFullYear()
    });

    const alerts = budgets.filter(budget => budget.shouldAlert()).map(budget => ({
      category: budget.category,
      percentageSpent: budget.percentageSpent,
      spentAmount: budget.spentAmount,
      budgetAmount: budget.budgetAmount,
      alertThreshold: budget.alertThreshold,
      isExceeded: budget.isExceeded()
    }));

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching budget alerts:', error);
    res.status(500).json({ message: 'Error fetching budget alerts', error: error.message });
  }
});

// Helper function to calculate spent amount from transactions
async function calculateSpentAmount(budget) {
  try {
    const startDate = new Date(budget.year, budget.month - 1, 1);
    const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);

    const result = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          category: budget.category,
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    budget.spentAmount = result.length > 0 ? result[0].total : 0;
  } catch (error) {
    console.error('Error calculating spent amount:', error);
    budget.spentAmount = 0;
  }
}

module.exports = router;