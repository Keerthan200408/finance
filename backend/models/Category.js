const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  icon: {
    type: String,
    default: 'category'
  },
  color: {
    type: String,
    default: '#757575',
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  description: {
    type: String,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Optional for now, will be required when authentication is added for user-specific categories
    // required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
categorySchema.index({ type: 1 });
categorySchema.index({ userId: 1 });

// Static method to get default categories
categorySchema.statics.getDefaultCategories = function() {
  return [
    // Expense categories
    { name: 'Food & Dining', type: 'expense', icon: 'restaurant', color: '#FF6384', isDefault: true },
    { name: 'Transportation', type: 'expense', icon: 'directions_car', color: '#36A2EB', isDefault: true },
    { name: 'Shopping', type: 'expense', icon: 'shopping_cart', color: '#FFCE56', isDefault: true },
    { name: 'Entertainment', type: 'expense', icon: 'movie', color: '#4BC0C0', isDefault: true },
    { name: 'Bills & Utilities', type: 'expense', icon: 'receipt', color: '#9966FF', isDefault: true },
    { name: 'Healthcare', type: 'expense', icon: 'local_hospital', color: '#FF9F40', isDefault: true },
    { name: 'Education', type: 'expense', icon: 'school', color: '#FF6384', isDefault: true },
    { name: 'Travel', type: 'expense', icon: 'flight', color: '#C9CBCF', isDefault: true },
    { name: 'Home & Garden', type: 'expense', icon: 'home', color: '#4CAF50', isDefault: true },
    { name: 'Personal Care', type: 'expense', icon: 'spa', color: '#E91E63', isDefault: true },
    { name: 'Gifts & Donations', type: 'expense', icon: 'card_giftcard', color: '#9C27B0', isDefault: true },
    { name: 'Other Expenses', type: 'expense', icon: 'more_horiz', color: '#607D8B', isDefault: true },
    
    // Income categories
    { name: 'Salary', type: 'income', icon: 'work', color: '#4CAF50', isDefault: true },
    { name: 'Freelance', type: 'income', icon: 'laptop', color: '#2196F3', isDefault: true },
    { name: 'Business Income', type: 'income', icon: 'business', color: '#FF9800', isDefault: true },
    { name: 'Investments', type: 'income', icon: 'trending_up', color: '#795548', isDefault: true },
    { name: 'Rental Income', type: 'income', icon: 'apartment', color: '#009688', isDefault: true },
    { name: 'Gifts Received', type: 'income', icon: 'redeem', color: '#E91E63', isDefault: true },
    { name: 'Other Income', type: 'income', icon: 'attach_money', color: '#8BC34A', isDefault: true }
  ];
};

// Static method to create default categories
categorySchema.statics.createDefaultCategories = async function() {
  const defaultCategories = this.getDefaultCategories();
  
  try {
    // Check if default categories already exist
    const existingCount = await this.countDocuments({ isDefault: true });
    
    if (existingCount === 0) {
      await this.insertMany(defaultCategories);
      console.log('Default categories created successfully');
    }
  } catch (error) {
    console.error('Error creating default categories:', error);
  }
};

module.exports = mongoose.model('Category', categorySchema);