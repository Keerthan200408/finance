import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Budget } from '../../models/finance.models';
import { FinanceService } from '../../services/finance.service';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  template: `
    <div class="budget-container">
      <div class="header">
        <h1>Budget Management</h1>
        <button mat-raised-button color="primary">
          <mat-icon>add</mat-icon>
          Add Budget
        </button>
      </div>

      <div class="budget-grid">
        <mat-card *ngFor="let budget of budgets" class="budget-card">
          <mat-card-header>
            <mat-card-title>{{budget.category}}</mat-card-title>
            <mat-card-subtitle>{{getMonthName(budget.month)}} {{budget.year}}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="budget-info">
              <div class="amount-info">
                <span class="spent">\${{budget.spentAmount | number:'1.2-2'}}</span>
                <span class="divider">/</span>
                <span class="total">\${{budget.budgetAmount | number:'1.2-2'}}</span>
              </div>
              <div class="percentage">{{getPercentage(budget)}}%</div>
            </div>
            <mat-progress-bar 
              [value]="getPercentage(budget)" 
              [color]="getProgressColor(budget)"
              mode="determinate">
            </mat-progress-bar>
            <div class="remaining" [class.over-budget]="budget.spentAmount > budget.budgetAmount">
              {{budget.spentAmount <= budget.budgetAmount ? 'Remaining: ' : 'Over budget by: '}}
              \${{Math.abs(budget.budgetAmount - budget.spentAmount) | number:'1.2-2'}}
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button>Edit</button>
            <button mat-button color="warn">Delete</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./budget.component.scss']
})
export class BudgetComponent implements OnInit {
  budgets: Budget[] = [];
  Math = Math;

  constructor(private financeService: FinanceService) {}

  ngOnInit() {
    this.loadBudgets();
  }

  private loadBudgets() {
    this.financeService.getBudgets().subscribe({
      next: (data) => {
        this.budgets = data;
      },
      error: (error) => {
        console.error('Error loading budgets:', error);
        this.loadMockBudgets();
      }
    });
  }

  private loadMockBudgets() {
    this.budgets = [
      {
        _id: '1',
        category: 'Food',
        budgetAmount: 800,
        spentAmount: 650,
        month: 1,
        year: 2024,
        alertThreshold: 80
      },
      {
        _id: '2',
        category: 'Transportation',
        budgetAmount: 300,
        spentAmount: 270,
        month: 1,
        year: 2024,
        alertThreshold: 80
      },
      {
        _id: '3',
        category: 'Entertainment',
        budgetAmount: 200,
        spentAmount: 180,
        month: 1,
        year: 2024,
        alertThreshold: 80
      }
    ];
  }

  getPercentage(budget: Budget): number {
    return Math.round((budget.spentAmount / budget.budgetAmount) * 100);
  }

  getProgressColor(budget: Budget): 'primary' | 'accent' | 'warn' {
    const percentage = this.getPercentage(budget);
    if (percentage >= 100) return 'warn';
    if (percentage >= budget.alertThreshold) return 'accent';
    return 'primary';
  }

  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }
}