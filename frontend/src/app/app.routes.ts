import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'auth', 
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'transactions', 
    loadComponent: () => import('./components/transactions/transactions.component').then(m => m.TransactionsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'budget', 
    loadComponent: () => import('./components/budget/budget.component').then(m => m.BudgetComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'reports', 
    loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];