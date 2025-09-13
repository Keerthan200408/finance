const express = require('express');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Transaction = require('../models/Transaction');

const router = express.Router();

// GET /api/reports/pdf - Export transactions as PDF
router.get('/pdf', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch transactions
    const transactions = await Transaction.find({
      date: { $gte: start, $lte: end }
    }).sort({ date: -1 });

    // Calculate summary
    const summary = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        acc.totalIncome += transaction.amount;
      } else {
        acc.totalExpenses += transaction.amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpenses: 0 });

    // Create PDF
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="financial-report-${start.toISOString().split('T')[0]}-to-${end.toISOString().split('T')[0]}.pdf"`);
    
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text('Financial Report', 50, 50);
    doc.fontSize(12).text(`Period: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, 50, 80);

    // Add summary
    doc.fontSize(16).text('Summary', 50, 120);
    doc.fontSize(12)
       .text(`Total Income: $${summary.totalIncome.toFixed(2)}`, 50, 150)
       .text(`Total Expenses: $${summary.totalExpenses.toFixed(2)}`, 50, 170)
       .text(`Net Savings: $${(summary.totalIncome - summary.totalExpenses).toFixed(2)}`, 50, 190);

    // Add transactions table
    doc.fontSize(16).text('Transactions', 50, 230);
    
    let yPosition = 260;
    const pageHeight = 750;

    // Table headers
    doc.fontSize(10)
       .text('Date', 50, yPosition)
       .text('Type', 120, yPosition)
       .text('Category', 170, yPosition)
       .text('Description', 250, yPosition)
       .text('Amount', 450, yPosition);

    yPosition += 20;

    // Add transactions
    transactions.forEach(transaction => {
      if (yPosition > pageHeight) {
        doc.addPage();
        yPosition = 50;
      }

      const sign = transaction.type === 'income' ? '+' : '-';
      
      doc.text(transaction.date.toLocaleDateString(), 50, yPosition)
         .text(transaction.type, 120, yPosition)
         .text(transaction.category, 170, yPosition)
         .text(transaction.description.substring(0, 30), 250, yPosition)
         .text(`${sign}$${transaction.amount.toFixed(2)}`, 450, yPosition);

      yPosition += 15;
    });

    doc.end();

  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({ message: 'Error generating PDF report', error: error.message });
  }
});

// GET /api/reports/excel - Export transactions as Excel
router.get('/excel', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch transactions
    const transactions = await Transaction.find({
      date: { $gte: start, $lte: end }
    }).sort({ date: -1 });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    // Add headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Amount', key: 'amount', width: 12 }
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data
    transactions.forEach(transaction => {
      worksheet.addRow({
        date: transaction.date.toLocaleDateString(),
        type: transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
        category: transaction.category,
        description: transaction.description,
        amount: transaction.type === 'income' ? transaction.amount : -transaction.amount
      });
    });

    // Add summary at the bottom
    const lastRow = worksheet.rowCount + 2;
    worksheet.getCell(`A${lastRow}`).value = 'Summary:';
    worksheet.getCell(`A${lastRow}`).font = { bold: true };

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    worksheet.getCell(`A${lastRow + 1}`).value = 'Total Income:';
    worksheet.getCell(`B${lastRow + 1}`).value = totalIncome;
    worksheet.getCell(`B${lastRow + 1}`).numFmt = '$#,##0.00';

    worksheet.getCell(`A${lastRow + 2}`).value = 'Total Expenses:';
    worksheet.getCell(`B${lastRow + 2}`).value = totalExpenses;
    worksheet.getCell(`B${lastRow + 2}`).numFmt = '$#,##0.00';

    worksheet.getCell(`A${lastRow + 3}`).value = 'Net Savings:';
    worksheet.getCell(`B${lastRow + 3}`).value = totalIncome - totalExpenses;
    worksheet.getCell(`B${lastRow + 3}`).numFmt = '$#,##0.00';
    worksheet.getCell(`B${lastRow + 3}`).font = { bold: true };

    // Format amount column
    worksheet.getColumn('amount').numFmt = '$#,##0.00';

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="financial-report-${start.toISOString().split('T')[0]}-to-${end.toISOString().split('T')[0]}.xlsx"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error generating Excel report:', error);
    res.status(500).json({ message: 'Error generating Excel report', error: error.message });
  }
});

module.exports = router;