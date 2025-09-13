import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Transaction, TransactionService } from '../../services/transaction.service';

interface Category {
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  template: `
    <div class="transactions-container">
      <div class="header">
        <h1>Transactions</h1>
        <button mat-raised-button color="primary" (click)="openAddTransactionDialog()">
          <mat-icon>add</mat-icon>
          Add Transaction
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="transactions" class="transactions-table">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let transaction">
                {{ formatDate(transaction.date) }}
              </td>
            </ng-container>

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let transaction">
                <span class="transaction-type" [class]="'type-' + transaction.type">
                  <mat-icon>{{ transaction.type === 'income' ? 'trending_up' : 'trending_down' }}</mat-icon>
                  {{ transaction.type | titlecase }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let transaction">
                {{ transaction.category }}
              </td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let transaction">
                {{ transaction.description }}
              </td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let transaction">
                <span class="amount" [class]="'amount-' + transaction.type">
                  {{ transaction.type === 'income' ? '+' : '-' }}${{ transaction.amount | number:'1.2-2' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let transaction">
                <button mat-icon-button color="primary" (click)="editTransaction(transaction)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteTransaction(transaction._id!)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <div *ngIf="transactions.length === 0" class="no-data">
            <mat-icon>receipt_long</mat-icon>
            <p>No transactions found. Add your first transaction to get started!</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  categories: Category[] = [];
  displayedColumns: string[] = ['date', 'type', 'category', 'description', 'amount', 'actions'];
  isLoading = false;

  constructor(
    private transactionService: TransactionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadTransactions();
    this.loadMockCategories();
  }

  private loadTransactions() {
    this.isLoading = true;
    this.transactionService.getTransactions().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.transactions = response.data;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading transactions:', error);
        this.snackBar.open('Failed to load transactions. Using demo data.', 'Close', { duration: 5000 });
        this.loadMockTransactions();
      }
    });
  }

  private loadMockTransactions() {
    this.transactions = [
      {
        _id: '1',
        userId: 'demo-user',
        type: 'expense',
        amount: 45.50,
        category: 'Food',
        description: 'Grocery shopping',
        date: new Date('2024-01-15')
      },
      {
        _id: '2',
        userId: 'demo-user',
        type: 'income',
        amount: 3000,
        category: 'Salary',
        description: 'Monthly salary',
        date: new Date('2024-01-01')
      },
      {
        _id: '3',
        userId: 'demo-user',
        type: 'expense',
        amount: 25.00,
        category: 'Transportation',
        description: 'Gas',
        date: new Date('2024-01-14')
      }
    ];
  }

  private loadMockCategories() {
    this.categories = [
      { name: 'Food', type: 'expense', icon: 'restaurant', color: '#FF6384' },
      { name: 'Transportation', type: 'expense', icon: 'directions_car', color: '#36A2EB' },
      { name: 'Entertainment', type: 'expense', icon: 'movie', color: '#FFCE56' },
      { name: 'Utilities', type: 'expense', icon: 'power', color: '#4BC0C0' },
      { name: 'Salary', type: 'income', icon: 'work', color: '#9966FF' },
      { name: 'Freelance', type: 'income', icon: 'laptop', color: '#FF9F40' }
    ];
  }

  formatDate(date: string | Date): string {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString();
  }

  openAddTransactionDialog() {
    // TODO: Implement transaction dialog
    this.snackBar.open('Add transaction dialog coming soon!', 'Close', { duration: 3000 });
  }

  editTransaction(transaction: Transaction) {
    // TODO: Implement edit transaction dialog
    this.snackBar.open('Edit transaction dialog coming soon!', 'Close', { duration: 3000 });
  }

  deleteTransaction(id: string) {
    if (!id) return;
    
    this.transactionService.deleteTransaction(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Transaction deleted successfully!', 'Close', { duration: 3000 });
          this.loadTransactions();
        }
      },
      error: (error) => {
        console.error('Error deleting transaction:', error);
        this.snackBar.open('Failed to delete transaction', 'Close', { duration: 3000 });
        // For demo purposes, remove from local array
        this.transactions = this.transactions.filter(t => t._id !== id);
      }
    });
  }
}