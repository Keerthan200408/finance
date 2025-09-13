# 💰 Financial Management Dashboard

A modern, full-stack personal finance management web application with **JWT Authentication** that helps users track expenses, manage budgets, and analyze their financial health through interactive dashboards and comprehensive reporting.

## ✨ Features

### 🔐 **User Authentication & Security**
- **JWT Authentication**: Secure user registration and login system
- **Protected Routes**: Route guards to protect authenticated pages
- **Token Management**: Automatic token refresh and secure storage
- **User Profiles**: Personalized user accounts with preferences
- **Password Hashing**: bcrypt encryption for secure password storage

### 🏠 **Dashboard Overview**
- **Real-time Balance**: Running total of income minus expenses
- **Monthly Summary**: Current month's income, expenses, and savings
- **Interactive Charts**: 
  - Pie chart showing spending breakdown by category
  - Line chart displaying monthly income/expense trends
- **Quick Statistics**: Key financial metrics at a glance
- **User-specific Data**: Each user sees only their own financial data

### 💳 **Transaction Management**
- **Add Transactions**: Record income and expenses with categories
- **Smart Categorization**: Pre-defined categories with custom icons and colors
- **User Isolation**: Transactions are isolated by authenticated user
- **Advanced Filtering**: Filter by date range, category, or transaction type
- **Edit & Delete**: Full CRUD operations with real-time updates

### 💰 **Budget Tracking**
- **Monthly Budgets**: Set spending limits by category
- **Visual Progress**: Progress bars showing budget utilization
- **Smart Alerts**: Get notified when reaching 80% of budget limit
- **Over-budget Tracking**: Monitor categories that exceed planned spending
- **User-specific Budgets**: Each user maintains their own budget plans

### 📊 **Financial Reports**
- **PDF Export**: Generate professional financial reports
- **Excel Export**: Download detailed transaction data for analysis
- **Custom Date Ranges**: Export data for any time period
- **Summary Statistics**: Comprehensive financial insights
- **Category Analysis**: Detailed spending breakdown by category

### 🎨 **Modern UI/UX**
- **Angular Material Design**: Clean, professional interface
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Authentication UI**: Beautiful login/register forms with validation
- **User Menu**: Header with user profile and logout functionality
- **Intuitive Navigation**: Easy-to-use sidebar navigation
- **Real-time Updates**: Dynamic data updates without page refresh

## 🛠 Tech Stack

### **Frontend**
- **Angular 18**: Modern TypeScript framework with standalone components
- **Angular Material**: Google's Material Design components
- **Chart.js**: Interactive charts and data visualization
- **RxJS**: Reactive programming for API calls and authentication state
- **JWT Handling**: Automatic token management and HTTP interceptors
- **SCSS**: Enhanced styling with variables and mixins

### **Backend**
- **Node.js**: JavaScript runtime environment
- **Express.js**: Fast, minimal web application framework
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: Object modeling for MongoDB
- **JWT**: JSON Web Tokens for secure authentication
- **bcryptjs**: Password hashing and security
- **PDFKit**: PDF generation for reports
- **ExcelJS**: Excel file generation for data export

### **Security & Authentication**
- **JSON Web Tokens (JWT)**: Stateless authentication system
- **bcrypt**: Password hashing with salt rounds
- **HTTP-only Cookies**: Secure token storage
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Express-validator for data sanitization
- **CORS**: Cross-origin resource sharing configuration

### **Additional Tools**
- **Express Validator**: Input validation and sanitization
- **Cookie Parser**: HTTP cookie parsing middleware
- **Express Rate Limit**: Rate limiting middleware
- **dotenv**: Environment variable management
- **Nodemon**: Development auto-restart utility

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas/database)
- **Git** - [Download here](https://git-scm.com/downloads)
- **Angular CLI** (optional, for development)

## 🚀 Quick Start

### 1. **Clone the Repository**
```bash
git clone <repository-url>
cd Finance_Management
```

### 2. **Environment Setup**
The project includes comprehensive `.gitignore` files to protect sensitive data:
- **Root `.gitignore`**: General files, logs, node_modules
- **Backend `.gitignore`**: Server-specific files, database files, JWT secrets
- **Frontend `.gitignore`**: Angular build files, cache, IDE files

⚠️ **Important**: Never commit `.env` files or JWT secrets to version control!

### 3. **Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables
copy .env.example .env

# Edit .env file with your configuration
# MONGODB_URI=mongodb://localhost:27017/finance-dashboard
# JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
# JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-minimum-32-characters
# JWT_EXPIRES_IN=24h
# JWT_REFRESH_EXPIRES_IN=7d
# NODE_ENV=development

# Start MongoDB (if running locally)
# mongod

# Start the backend server
npm run dev
```

The backend server will start on `http://localhost:3000`

### 4. **Frontend Setup**
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

### 5. **Git Setup (Optional)**
```bash
# Initialize git repository (if not already cloned)
git init

# Add all files (gitignore will protect sensitive files)
git add .

# Make initial commit
git commit -m "Initial commit: Finance Management Dashboard with JWT Authentication"

# Add your remote repository
git remote add origin <your-repository-url>

# Push to remote
git push -u origin main
```

**Important Git Notes:**
- ✅ `.env` files are automatically ignored
- ✅ `node_modules` directories are ignored
- ✅ Build outputs (`dist/`, `.angular/`) are ignored
- ✅ IDE files (`.vscode/`, `.idea/`) are ignored
- ✅ Log files and temporary files are ignored

The frontend application will start on `http://localhost:4200`

### 4. **Initialize Sample Data**
Visit `http://localhost:3000/api/categories/initialize` to create default categories.

## � Authentication Flow

### User Registration & Login Process
1. **Registration**: New users create accounts with email/password
2. **Password Hashing**: Passwords are securely hashed using bcrypt
3. **JWT Generation**: Server issues access and refresh tokens
4. **Token Storage**: Tokens stored securely in localStorage
5. **Protected Routes**: Frontend guards prevent unauthorized access
6. **Automatic Refresh**: Expired tokens are automatically renewed

### API Authentication
- **All financial data endpoints require JWT authentication**
- **Users can only access their own data (user isolation)**
- **Token validation on every protected route**
- **Rate limiting to prevent abuse**

### Security Features
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT tokens with configurable expiration
- ✅ Automatic token refresh mechanism
- ✅ HTTP-only cookie support (optional)
- ✅ Rate limiting on auth endpoints
- ✅ Input validation and sanitization
- ✅ CORS configuration for secure cross-origin requests

## �📁 Project Structure

```
Finance_Management/
├── backend/                    # Node.js/Express API
│   ├── models/                # MongoDB schemas
│   │   ├── User.js            # User authentication model
│   │   ├── Transaction.js     # Transaction model (user-linked)
│   │   ├── Budget.js          # Budget model (user-linked)
│   │   └── Category.js        # Category model
│   ├── routes/                # API endpoints
│   │   ├── auth.js            # Authentication routes
│   │   ├── transactions.js    # Transaction CRUD (protected)
│   │   ├── budgets.js         # Budget management (protected)
│   │   ├── categories.js      # Category management
│   │   ├── dashboard.js       # Dashboard statistics (protected)
│   │   └── reports.js         # Export functionality (protected)
│   ├── utils/                 # Utility functions
│   │   └── auth.js            # JWT utilities and middleware
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   └── .env.example           # Environment variables template
│
├── frontend/                  # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/          # Authentication module
│   │   │   │   ├── login/     # Login component
│   │   │   │   ├── register/  # Registration component
│   │   │   │   └── auth-layout/ # Auth page layout
│   │   │   ├── components/    # Main app components
│   │   │   │   ├── dashboard/ # Dashboard component
│   │   │   │   ├── transactions/ # Transaction management
│   │   │   │   ├── budget/    # Budget tracking
│   │   │   │   └── reports/   # Report generation
│   │   │   ├── guards/        # Route protection
│   │   │   │   ├── auth.guard.ts # Protect authenticated routes
│   │   │   │   └── guest.guard.ts # Redirect logged-in users
│   │   │   ├── interceptors/  # HTTP interceptors
│   │   │   │   └── auth.interceptor.ts # Auto token attachment
│   │   │   ├── services/      # Angular services
│   │   │   │   ├── auth.service.ts # Authentication logic
│   │   │   │   └── transaction.service.ts # API calls
│   │   │   ├── shared/        # Shared components
│   │   │   │   └── header/    # Navigation header
│   │   │   ├── app.component.*# Root component
│   │   │   └── app.routes.ts  # Angular routing with guards
│   │   ├── styles.scss        # Global styles
│   │   └── index.html         # Main HTML file
│   ├── angular.json           # Angular configuration
│   ├── package.json           # Frontend dependencies
│   └── tsconfig.json          # TypeScript configuration
│
└── README.md                  # Project documentation
```

## 🔧 Configuration

### **Environment Variables**
Create a `.env` file in the `backend` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/finance-dashboard

# Server
NODE_ENV=development
PORT=3000

# Security (for future authentication)
JWT_SECRET=your-super-secret-jwt-key-here
```

### **MongoDB Setup Options**

#### **Option 1: Local MongoDB**
1. Install MongoDB Community Server
2. Start MongoDB service: `mongod`
3. Use connection string: `mongodb://localhost:27017/finance-dashboard`

#### **Option 2: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string from Atlas dashboard
4. Update `MONGODB_URI` in `.env` file

## 📱 Usage Guide

### **Getting Started**
1. **Dashboard**: View your financial overview with charts and statistics
2. **Add Categories**: Initialize default categories or create custom ones
3. **Record Transactions**: Start adding your income and expenses
4. **Set Budgets**: Create monthly budgets for your expense categories
5. **Generate Reports**: Export your financial data as PDF or Excel

### **Adding Transactions**
1. Navigate to the "Transactions" page
2. Click "Add Transaction" button
3. Fill in the form:
   - **Type**: Income or Expense
   - **Amount**: Transaction amount
   - **Category**: Select from dropdown
   - **Description**: Brief description
   - **Date**: Transaction date
   - **Recurring**: Optional recurring setup
4. Click "Save" to add the transaction

### **Setting Up Budgets**
1. Go to the "Budget" page
2. Click "Add Budget" button
3. Configure:
   - **Category**: Select expense category
   - **Budget Amount**: Monthly spending limit
   - **Month/Year**: Budget period
   - **Alert Threshold**: Warning percentage (default: 80%)
4. Monitor progress with visual indicators

### **Generating Reports**
1. Navigate to the "Reports" page
2. Select date range using date pickers
3. Choose export format:
   - **PDF**: Professional formatted report
   - **Excel**: Raw data for further analysis
4. Download generated file

## 🔌 API Endpoints

### **Transactions**
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### **Budgets**
- `GET /api/budgets` - Get budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/alerts/current` - Get budget alerts

### **Categories**
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `POST /api/categories/initialize` - Initialize default categories

### **Dashboard**
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/summary` - Get period summary

### **Reports**
- `GET /api/reports/pdf` - Export PDF report
- `GET /api/reports/excel` - Export Excel report

## 🎯 Development

### **Running in Development Mode**

**Backend:**
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

**Frontend:**
```bash
cd frontend
npm start  # Angular dev server with hot reload
```

### **Building for Production**

**Frontend:**
```bash
cd frontend
npm run build  # Creates dist/ folder
```

**Backend:**
```bash
cd backend
npm start  # Production server
```

### **Adding New Features**

1. **Backend**: Add routes in `routes/`, models in `models/`
2. **Frontend**: Create components in `components/`, update services in `services/`
3. **Database**: Update Mongoose schemas as needed
4. **UI**: Use Angular Material components for consistency

## 🐛 Troubleshooting

### **Common Issues**

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access for MongoDB Atlas

**Port Already in Use:**
- Change PORT in `.env` file
- Kill existing processes: `netstat -ano | findstr :3000`

**Angular Build Errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Update Angular CLI: `npm install -g @angular/cli@latest`

**CORS Errors:**
- Verify backend CORS configuration
- Check API base URL in frontend service

## 🚀 Deployment

### **Frontend (Netlify/Vercel)**
```bash
cd frontend
npm run build
# Deploy dist/ folder to hosting service
```

### **Backend (Heroku/Railway)**
```bash
# Add Procfile: web: node server.js
# Set environment variables on hosting platform
# Connect MongoDB Atlas for database
```

### **Full Stack (Docker)**
```dockerfile
# Create Dockerfile for each service
# Use docker-compose for multi-container setup
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Angular Material** for the beautiful UI components
- **Chart.js** for interactive data visualization
- **MongoDB** for flexible data storage
- **Express.js** for the robust API framework

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Search existing issues on GitHub
3. Create a new issue with detailed information
4. Join our community discussions

---

**Happy budgeting! 💰✨**

Made with ❤️ for better financial management.