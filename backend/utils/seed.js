const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Budget = require('../models/Budget');

// Sample data
const sampleTransactions = [
  {
    type: 'income',
    amount: 5000,
    category: 'Salary',
    description: 'Monthly salary from Tech Corp',
    date: new Date('2024-01-01'),
    recurring: true,
    recurringFrequency: 'monthly'
  },
  {
    type: 'expense',
    amount: 1200,
    category: 'Food & Dining',
    description: 'Grocery shopping at Walmart',
    date: new Date('2024-01-15'),
    recurring: false
  },
  {
    type: 'expense',
    amount: 800,
    category: 'Bills & Utilities',
    description: 'Monthly rent payment',
    date: new Date('2024-01-01'),
    recurring: true,
    recurringFrequency: 'monthly'
  },
  {
    type: 'expense',
    amount: 150,
    category: 'Transportation',
    description: 'Gas for car',
    date: new Date('2024-01-10'),
    recurring: false
  },
  {
    type: 'expense',
    amount: 300,
    category: 'Entertainment',
    description: 'Movie tickets and dinner',
    date: new Date('2024-01-12'),
    recurring: false
  },
  {
    type: 'income',
    amount: 800,
    category: 'Freelance',
    description: 'Web development project',
    date: new Date('2024-01-20'),
    recurring: false
  },
  {
    type: 'expense',
    amount: 200,
    category: 'Healthcare',
    description: 'Doctor visit and medication',
    date: new Date('2024-01-08'),
    recurring: false
  },
  {
    type: 'expense',
    amount: 450,
    category: 'Shopping',
    description: 'Clothes and accessories',
    date: new Date('2024-01-18'),
    recurring: false
  }
];

const sampleBudgets = [
  {
    category: 'Food & Dining',
    budgetAmount: 1500,
    month: 1,
    year: 2024,
    alertThreshold: 80
  },
  {
    category: 'Transportation',
    budgetAmount: 400,
    month: 1,
    year: 2024,
    alertThreshold: 85
  },
  {
    category: 'Entertainment',
    budgetAmount: 500,
    month: 1,
    year: 2024,
    alertThreshold: 75
  },
  {
    category: 'Shopping',
    budgetAmount: 600,
    month: 1,
    year: 2024,
    alertThreshold: 80
  },
  {
    category: 'Healthcare',
    budgetAmount: 300,
    month: 1,
    year: 2024,
    alertThreshold: 90
  }
];

async function seedData() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-dashboard';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Transaction.deleteMany({});
    await Budget.deleteMany({});
    await Category.deleteMany({});

    // Create default categories
    console.log('Creating default categories...');
    await Category.createDefaultCategories();

    // Create sample transactions
    console.log('Creating sample transactions...');
    await Transaction.insertMany(sampleTransactions);

    // Create sample budgets and calculate spent amounts
    console.log('Creating sample budgets...');
    for (const budgetData of sampleBudgets) {
      const budget = new Budget(budgetData);
      
      // Calculate spent amount from transactions
      const startDate = new Date(budget.year, budget.month - 1, 1);
      const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);
      
      const spentResult = await Transaction.aggregate([
        {
          $match: {
            type: 'expense',
            category: budget.category,
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      budget.spentAmount = spentResult.length > 0 ? spentResult[0].total : 0;
      await budget.save();
    }

    console.log('\\n✅ Sample data created successfully!');
    console.log('\\n📊 Data Summary:');
    console.log(`   • Categories: ${await Category.countDocuments()}`);
    console.log(`   • Transactions: ${await Transaction.countDocuments()}`);
    console.log(`   • Budgets: ${await Budget.countDocuments()}`);
    
    console.log('\\n🚀 You can now start using the Finance Dashboard!');
    console.log('   • Frontend: http://localhost:4200');
    console.log('   • Backend API: http://localhost:3000');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seed function
if (require.main === module) {
  require('dotenv').config();
  seedData();
}

module.exports = { seedData };