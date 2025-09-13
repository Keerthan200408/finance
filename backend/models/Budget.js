const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  budgetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  spentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true,
    min: 2020
  },
  alertThreshold: {
    type: Number,
    default: 80,
    min: 0,
    max: 100
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one budget per category per month per user
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

// Virtual for percentage spent
budgetSchema.virtual('percentageSpent').get(function() {
  return Math.round((this.spentAmount / this.budgetAmount) * 100);
});

// Virtual for remaining amount
budgetSchema.virtual('remainingAmount').get(function() {
  return this.budgetAmount - this.spentAmount;
});

// Instance method to check if budget is exceeded
budgetSchema.methods.isExceeded = function() {
  return this.spentAmount > this.budgetAmount;
};

// Instance method to check if alert threshold is reached
budgetSchema.methods.shouldAlert = function() {
  return this.percentageSpent >= this.alertThreshold;
};

// Static method to get current month budgets
budgetSchema.statics.getCurrentMonthBudgets = function(userId = null) {
  const now = new Date();
  const query = {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
  
  if (userId) {
    query.userId = userId;
  }
  
  return this.find(query);
};

module.exports = mongoose.model('Budget', budgetSchema);