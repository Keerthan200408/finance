import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transaction {
  _id?: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date | string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransactionFilters {
  category?: string;
  type?: 'income' | 'expense';
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'http://localhost:3000/api/transactions';

  constructor(private http: HttpClient) { }

  getTransactions(filters?: TransactionFilters): Observable<ApiResponse<Transaction[]>> {
    let url = this.apiUrl;
    const params = new URLSearchParams();

    if (filters) {
      if (filters.category) params.append('category', filters.category);
      if (filters.type) params.append('type', filters.type);
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters.minAmount) params.append('minAmount', filters.minAmount.toString());
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return this.http.get<ApiResponse<Transaction[]>>(url);
  }

  getTransaction(id: string): Observable<ApiResponse<Transaction>> {
    return this.http.get<ApiResponse<Transaction>>(`${this.apiUrl}/${id}`);
  }

  createTransaction(transaction: Omit<Transaction, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(this.apiUrl, transaction);
  }

  updateTransaction(id: string, transaction: Partial<Transaction>): Observable<ApiResponse<Transaction>> {
    return this.http.put<ApiResponse<Transaction>>(`${this.apiUrl}/${id}`, transaction);
  }

  deleteTransaction(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getTransactionsByCategory(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/analytics/by-category`);
  }

  getMonthlyTransactions(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/analytics/monthly`);
  }

  getTransactionSummary(): Observable<ApiResponse<{
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    transactionCount: number;
  }>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/analytics/summary`);
  }
}