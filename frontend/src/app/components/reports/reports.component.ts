import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { FinanceService } from '../../services/finance.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="reports-container">
      <h1>Financial Reports</h1>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Export Transaction Reports</mat-card-title>
          <mat-card-subtitle>Generate PDF or Excel reports for a specific date range</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="reportForm" class="report-form">
            <div class="date-range">
              <mat-form-field appearance="outline">
                <mat-label>Start Date</mat-label>
                <input matInput [matDatepicker]="startPicker" formControlName="startDate">
                <mat-hint>MM/DD/YYYY</mat-hint>
                <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>End Date</mat-label>
                <input matInput [matDatepicker]="endPicker" formControlName="endDate">
                <mat-hint>MM/DD/YYYY</mat-hint>
                <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="export-buttons">
              <button mat-raised-button color="primary" (click)="exportPDF()">
                <mat-icon>picture_as_pdf</mat-icon>
                Export as PDF
              </button>
              <button mat-raised-button color="accent" (click)="exportExcel()">
                <mat-icon>table_chart</mat-icon>
                Export as Excel
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <div class="summary-cards">
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Quick Summary</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="summary-item">
              <span class="label">Total Transactions:</span>
              <span class="value">245</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Income:</span>
              <span class="value income">\$15,000.00</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Expenses:</span>
              <span class="value expense">\$8,500.00</span>
            </div>
            <div class="summary-item">
              <span class="label">Net Savings:</span>
              <span class="value savings">\$6,500.00</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Top Categories</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="category-item">
              <span class="category-name">Food & Dining</span>
              <span class="category-amount">\$2,400.00</span>
            </div>
            <div class="category-item">
              <span class="category-name">Transportation</span>
              <span class="category-amount">\$1,800.00</span>
            </div>
            <div class="category-item">
              <span class="category-name">Entertainment</span>
              <span class="category-amount">\$1,200.00</span>
            </div>
            <div class="category-item">
              <span class="category-name">Utilities</span>
              <span class="category-amount">\$800.00</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {
  reportForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private financeService: FinanceService
  ) {
    this.reportForm = this.fb.group({
      startDate: [new Date(new Date().getFullYear(), new Date().getMonth(), 1)],
      endDate: [new Date()]
    });
  }

  exportPDF() {
    const { startDate, endDate } = this.reportForm.value;
    this.financeService.exportTransactionsPDF(startDate, endDate).subscribe({
      next: (blob) => {
        this.downloadFile(blob, 'financial-report.pdf');
      },
      error: (error) => {
        console.error('Error exporting PDF:', error);
        // For demo purposes, show success message
        alert('PDF export feature will be available once the backend is connected!');
      }
    });
  }

  exportExcel() {
    const { startDate, endDate } = this.reportForm.value;
    this.financeService.exportTransactionsExcel(startDate, endDate).subscribe({
      next: (blob) => {
        this.downloadFile(blob, 'financial-report.xlsx');
      },
      error: (error) => {
        console.error('Error exporting Excel:', error);
        // For demo purposes, show success message
        alert('Excel export feature will be available once the backend is connected!');
      }
    });
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}