import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="glass-nav">
      <div class="container d-flex justify-between align-center" style="height: 70px;">
        <a routerLink="/" class="text-accent" style="font-size: 1.5rem; font-weight: 700;">HabitLog</a>
        
        <div class="d-flex align-center gap-4">
          @if (auth.currentUser()) {
            <div class="d-flex align-center gap-4">
              <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
              <a routerLink="/statistics" routerLinkActive="active" class="nav-link">Statistics</a>
              <a routerLink="/profile" routerLinkActive="active" class="nav-link">Profile</a>
            </div>
            
            <div class="d-flex align-center gap-2" style="margin-left: 1rem;">
              <div class="xp-badge">
                <span class="text-accent">⭐ {{ auth.currentUser()?.xp }} XP</span>
              </div>
              <button class="btn btn-secondary" style="padding: 0.4rem 1rem;" (click)="logout()">Logout</button>
            </div>
          } @else {
            <a routerLink="/login" class="btn btn-primary">Login</a>
          }
        </div>
      </div>
    </nav>
  `,
  styles: `
    .nav-link {
      color: var(--text-primary);
      font-weight: 500;
      transition: color var(--transition-fast);
      text-decoration: none;
    }
    .nav-link:hover, .nav-link.active {
      color: var(--accent-primary);
    }
    .xp-badge {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 20px;
      padding: 0.4rem 1rem;
      font-weight: 600;
    }
  `
})
export class NavBar {
  auth = inject(AuthService);

  logout() {
    this.auth.logout();
  }
}
