import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './services/auth.service';
import { HeaderComponent } from './shared/header/header.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    HeaderComponent
  ],
  template: `
    <div class="app-container">
      <app-header></app-header>
      
      <!-- Main Content with Sidebar for authenticated users -->
      <div class="content-container" *ngIf="isAuthenticated$ | async; else authContent">
        <mat-sidenav-container class="sidenav-container">
          <mat-sidenav #sidenav mode="side" opened class="sidenav">
            <mat-nav-list>
              <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
                <mat-icon>dashboard</mat-icon>
                <span>Dashboard</span>
              </a>
              <a mat-list-item routerLink="/transactions" routerLinkActive="active">
                <mat-icon>receipt_long</mat-icon>
                <span>Transactions</span>
              </a>
              <a mat-list-item routerLink="/budget" routerLinkActive="active">
                <mat-icon>savings</mat-icon>
                <span>Budget</span>
              </a>
              <a mat-list-item routerLink="/reports" routerLinkActive="active">
                <mat-icon>bar_chart</mat-icon>
                <span>Reports</span>
              </a>
            </mat-nav-list>
          </mat-sidenav>
          <mat-sidenav-content class="main-content">
            <router-outlet></router-outlet>
          </mat-sidenav-content>
        </mat-sidenav-container>
      </div>

      <!-- Auth Content (no sidebar) -->
      <ng-template #authContent>
        <div class="auth-content">
          <router-outlet></router-outlet>
        </div>
      </ng-template>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'finance-dashboard';
  isAuthenticated$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ngOnInit(): void {
    // Initialize authentication state
  }
}