const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { authenticate } = require('../utils/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Validation middleware
const validateTransaction = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
  body('recurring').optional().isBoolean().withMessage('Recurring must be a boolean'),
  body('recurringFrequency').optional().isIn(['daily', 'weekly', 'monthly', 'yearly'])
];

// GET /api/transactions - Get all transactions
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, type, category, startDate, endDate } = req.query;
    const query = { userId: req.user._id };

    // Add filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

// GET /api/transactions/:id - Get transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Error fetching transaction', error: error.message });
  }
});

// POST /api/transactions - Create new transaction
router.post('/', validateTransaction, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = new Transaction({
      ...req.body,
      userId: req.user._id
    });
    await transaction.save();

    // Update budget if this is an expense
    if (transaction.type === 'expense') {
      await updateBudgetSpending(transaction.category, transaction.amount, transaction.date, req.user._id);
    }

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
});

// PUT /api/transactions/:id - Update transaction
router.put('/:id', validateTransaction, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const oldTransaction = await Transaction.findById(req.params.id);
    if (!oldTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Update budget spending if amounts or categories changed
    if (oldTransaction.type === 'expense' || transaction.type === 'expense') {
      // Remove old expense from budget
      if (oldTransaction.type === 'expense') {
        await updateBudgetSpending(oldTransaction.category, -oldTransaction.amount, oldTransaction.date);
      }
      
      // Add new expense to budget
      if (transaction.type === 'expense') {
        await updateBudgetSpending(transaction.category, transaction.amount, transaction.date);
      }
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
});

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Remove from budget if it's an expense
    if (transaction.type === 'expense') {
      await updateBudgetSpending(transaction.category, -transaction.amount, transaction.date);
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
});

// Helper function to update budget spending
async function updateBudgetSpending(category, amount, date, userId) {
  try {
    const transactionDate = new Date(date);
    const month = transactionDate.getMonth() + 1;
    const year = transactionDate.getFullYear();

    const budget = await Budget.findOne({ category, month, year, userId });
    if (budget) {
      budget.spentAmount = Math.max(0, budget.spentAmount + amount);
      await budget.save();
    }
  } catch (error) {
    console.error('Error updating budget spending:', error);
  }
}

module.exports = router;