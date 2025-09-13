const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  recurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: function() {
      return this.recurring;
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ type: 1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return `$${this.amount.toFixed(2)}`;
});

// Instance method to check if transaction is this month
transactionSchema.methods.isThisMonth = function() {
  const now = new Date();
  const transactionDate = new Date(this.date);
  return transactionDate.getMonth() === now.getMonth() && 
         transactionDate.getFullYear() === now.getFullYear();
};

module.exports = mongoose.model('Transaction', transactionSchema);