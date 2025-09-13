import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration } from 'chart.js';
import { TransactionService } from '../../services/transaction.service';

interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  transactionCount: number;
  categoryBreakdown: { category: string; amount: number }[];
  monthlyTrends: { month: string; income: number; expenses: number; savings: number }[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    BaseChartDirective
  ],
  template: `
    <div class="dashboard-container">
      <h1>Financial Dashboard</h1>
      
      <mat-grid-list cols="4" rowHeight="200px" gutterSize="16">
        <mat-grid-tile>
          <mat-card class="stat-card income">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon>trending_up</mat-icon>
                <span>Total Income</span>
              </div>
              <div class="stat-value">\${{stats?.totalIncome | number:'1.2-2' || 0}}</div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
        
        <mat-grid-tile>
          <mat-card class="stat-card expense">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon>trending_down</mat-icon>
                <span>Total Expenses</span>
              </div>
              <div class="stat-value">\${{stats?.totalExpenses | number:'1.2-2' || 0}}</div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
        
        <mat-grid-tile>
          <mat-card class="stat-card balance" [class.negative]="(stats?.netSavings || 0) < 0">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon>account_balance_wallet</mat-icon>
                <span>Net Savings</span>
              </div>
              <div class="stat-value">\${{stats?.netSavings | number:'1.2-2' || 0}}</div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
        
        <mat-grid-tile>
          <mat-card class="stat-card transactions">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon>receipt</mat-icon>
                <span>Transactions</span>
              </div>
              <div class="stat-value">{{stats?.transactionCount || 0}}</div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>

      <div class="charts-container">
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Spending by Category</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-wrapper">
              <canvas #pieChart baseChart
                [data]="pieChartData"
                [type]="'pie'"
                [options]="pieChartOptions">
              </canvas>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Monthly Trends</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-wrapper">
              <canvas #lineChart baseChart
                [data]="lineChartData"
                [type]="'line'"
                [options]="lineChartOptions">
              </canvas>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;

  pieChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
      ]
    }]
  };

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Income',
        data: [],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4
      },
      {
        label: 'Expenses',
        data: [],
        borderColor: '#F44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        tension: 0.4
      },
      {
        label: 'Savings',
        data: [],
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.4
      }
    ]
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.transactionService.getTransactionSummary().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Convert API response to dashboard stats
          this.stats = {
            totalIncome: response.data.totalIncome,
            totalExpenses: response.data.totalExpenses,
            netSavings: response.data.netIncome,
            transactionCount: response.data.transactionCount,
            categoryBreakdown: [],
            monthlyTrends: []
          };
          this.loadMockData(); // Load additional mock data for charts
        }
      },
      error: (error: any) => {
        console.error('Error loading dashboard data:', error);
        // Load mock data for development
        this.loadMockData();
      }
    });
  }

  private loadMockData() {
    this.stats = {
      totalIncome: 15000,
      totalExpenses: 8500,
      netSavings: 6500,
      transactionCount: 125,
      categoryBreakdown: [
        { category: 'Food', amount: 1200 },
        { category: 'Transportation', amount: 800 },
        { category: 'Entertainment', amount: 600 },
        { category: 'Utilities', amount: 400 },
        { category: 'Shopping', amount: 200 }
      ],
      monthlyTrends: [
        { month: 'Jul', income: 4800, expenses: 3100, savings: 1700 },
        { month: 'Aug', income: 5200, expenses: 2900, savings: 2300 },
        { month: 'Sep', income: 5000, expenses: 3200, savings: 1800 }
      ]
    };
    this.updateCharts();
  }

  private updateCharts() {
    if (!this.stats) return;

    // Update pie chart
    this.pieChartData.labels = this.stats.categoryBreakdown.map(c => c.category);
    this.pieChartData.datasets[0].data = this.stats.categoryBreakdown.map(c => c.amount);

    // Update line chart
    this.lineChartData.labels = this.stats.monthlyTrends.map(t => t.month);
    this.lineChartData.datasets[0].data = this.stats.monthlyTrends.map(t => t.income);
    this.lineChartData.datasets[1].data = this.stats.monthlyTrends.map(t => t.expenses);
    this.lineChartData.datasets[2].data = this.stats.monthlyTrends.map(t => t.savings);
  }
}