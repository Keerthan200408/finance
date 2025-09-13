const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');

const router = express.Router();

// Validation middleware
const validateCategory = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('icon').optional().trim(),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Color must be a valid hex color'),
  body('description').optional().trim()
];

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const query = {};

    if (type) {
      query.type = type;
    }

    const categories = await Category.find(query).sort({ type: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// GET /api/categories/:id - Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
});

// POST /api/categories - Create new category
router.post('/', validateCategory, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp('^' + req.body.name + '$', 'i') } 
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
});

// PUT /api/categories/:id - Update category
router.put('/:id', validateCategory, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if category with same name already exists (excluding current category)
    const existingCategory = await Category.findOne({ 
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp('^' + req.body.name + '$', 'i') } 
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Prevent deletion of default categories
    if (category.isDefault) {
      return res.status(400).json({ message: 'Default categories cannot be deleted' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
});

// POST /api/categories/initialize - Initialize default categories
router.post('/initialize', async (req, res) => {
  try {
    await Category.createDefaultCategories();
    const categories = await Category.find({ isDefault: true }).sort({ type: 1, name: 1 });
    res.json({ 
      message: 'Default categories initialized successfully', 
      categories: categories.length 
    });
  } catch (error) {
    console.error('Error initializing categories:', error);
    res.status(500).json({ message: 'Error initializing categories', error: error.message });
  }
});

// GET /api/categories/stats/usage - Get category usage statistics
router.get('/stats/usage', async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching category usage stats:', error);
    res.status(500).json({ message: 'Error fetching category usage stats', error: error.message });
  }
});

module.exports = router;