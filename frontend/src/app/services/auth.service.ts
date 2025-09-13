import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  initials: string;
  preferences: {
    currency: string;
    theme: string;
    language: string;
  };
  lastLogin?: Date;
  createdAt: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: string;
  };
  errors?: any[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      this.getCurrentUser().subscribe({
        next: () => {
          this.isAuthenticatedSubject.next(true);
        },
        error: () => {
          this.logout();
        }
      });
    }
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.handleAuthSuccess(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.handleAuthSuccess(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {})
      .pipe(
        tap(() => {
          this.handleLogout();
        }),
        catchError(error => {
          // Even if the server request fails, clean up locally
          this.handleLogout();
          return throwError(() => error);
        })
      );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<{ success: boolean; data: { user: User } }>(`${this.apiUrl}/me`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            this.currentUserSubject.next(response.data.user);
            return response.data.user;
          }
          throw new Error('Failed to get current user');
        }),
        catchError(this.handleError)
      );
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<{ success: boolean; data: { user: User } }>(`${this.apiUrl}/profile`, userData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            this.currentUserSubject.next(response.data.user);
            return response.data.user;
          }
          throw new Error('Failed to update profile');
        }),
        catchError(this.handleError)
      );
  }

  refreshToken(): Observable<{ token: string; refreshToken: string }> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<{ success: boolean; data: { token: string; refreshToken: string } }>(
      `${this.apiUrl}/refresh`, 
      { refreshToken }
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setToken(response.data.token);
          this.setRefreshToken(response.data.refreshToken);
        }
      }),
      map(response => response.data),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private handleAuthSuccess(data: AuthResponse['data']): void {
    if (data) {
      this.setToken(data.token);
      this.setRefreshToken(data.refreshToken);
      this.currentUserSubject.next(data.user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  private handleLogout(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.errors) {
      errorMessage = error.error.errors.map((err: any) => err.msg).join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  };

  // Token management
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('finance_app_token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('finance_app_token', token);
    }
  }

  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('finance_app_token');
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('finance_app_refresh_token');
    }
    return null;
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('finance_app_refresh_token', token);
    }
  }

  private removeRefreshToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('finance_app_refresh_token');
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch {
      return true;
    }
  }

  // Utility methods
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}