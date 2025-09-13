import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Transaction, Budget, Category, DashboardStats } from '../models/finance.models';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`);
  }

  // Transactions
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`);
  }

  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/transactions/${id}`);
  }

  createTransaction(transaction: Omit<Transaction, '_id'>): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/transactions`, transaction);
  }

  updateTransaction(id: string, transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/transactions/${id}`, transaction);
  }

  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/transactions/${id}`);
  }

  // Budgets
  getBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.apiUrl}/budgets`);
  }

  createBudget(budget: Omit<Budget, '_id'>): Observable<Budget> {
    return this.http.post<Budget>(`${this.apiUrl}/budgets`, budget);
  }

  updateBudget(id: string, budget: Partial<Budget>): Observable<Budget> {
    return this.http.put<Budget>(`${this.apiUrl}/budgets/${id}`, budget);
  }

  deleteBudget(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/budgets/${id}`);
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  createCategory(category: Omit<Category, '_id'>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }

  // Reports
  exportTransactionsPDF(startDate: Date, endDate: Date): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/pdf`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      responseType: 'blob'
    });
  }

  exportTransactionsExcel(startDate: Date, endDate: Date): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/excel`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      responseType: 'blob'
    });
  }
}