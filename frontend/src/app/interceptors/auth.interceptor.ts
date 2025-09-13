import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, switchMap, filter, take, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add auth token to requests
    const authRequest = this.addAuthToken(request);
    
    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(authRequest, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addAuthToken(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getToken();
    
    if (token && !this.isAuthEndpoint(request.url)) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return request;
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((tokens: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(tokens.token);
          
          const newRequest = this.addAuthToken(request);
          return next.handle(newRequest);
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.logout().subscribe();
          this.router.navigate(['/auth/login']);
          return throwError(() => error);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      // Wait for refresh to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(() => {
          const newRequest = this.addAuthToken(request);
          return next.handle(newRequest);
        })
      );
    }
  }

  private isAuthEndpoint(url: string): boolean {
    return url.includes('/auth/login') || 
           url.includes('/auth/register') || 
           url.includes('/auth/refresh');
  }
}