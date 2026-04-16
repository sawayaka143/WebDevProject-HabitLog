import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgClass, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, UpperCasePipe],
  template: `
    <nav class="glass-nav">
      <div class="container d-flex justify-between align-center" style="height: 60px;">
        <a routerLink="/" class="text-primary" style="font-size: 1.25rem; font-weight: 600; letter-spacing: 0.5px;">HabitLog</a>
        
        <div class="d-flex align-center gap-4">
          @if (auth.currentUser()) {
            <div class="dropdown-container">
              <button class="avatar-btn" (click)="toggleDropdown($event)">
                {{ auth.currentUser()?.username?.[0] | uppercase }}
              </button>
              
              <div class="dropdown-menu" [ngClass]="{'show': isDropdownOpen()}">
                <div class="dropdown-header">
                  <span class="user-name">{{ auth.currentUser()?.username }}</span>
                  <span class="user-xp">{{ auth.currentUser()?.xp }} XP</span>
                </div>
                <div class="dropdown-divider"></div>
                
                <a routerLink="/dashboard" class="dropdown-item" (click)="closeDropdown()">📋 Dashboard</a>
                <a routerLink="/statistics" class="dropdown-item" (click)="closeDropdown()">📊 Statistics</a>
                <a routerLink="/profile" class="dropdown-item" (click)="closeDropdown()">⚙️ Settings & Profile</a>
                
                <div class="dropdown-divider"></div>
                <button class="dropdown-item text-danger" (click)="logout()">🚪 Logout</button>
              </div>
            </div>
          } @else {
            <a routerLink="/login" class="btn btn-primary" style="padding: 0.4rem 1rem;">Login</a>
          }
        </div>
      </div>
    </nav>
  `,
  styles: `
    .glass-nav {
      background: var(--bg-primary);
      border-bottom: 1px solid var(--bg-secondary);
      box-shadow: none;
    }
    .avatar-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--accent-secondary);
      color: var(--text-primary);
      border: none;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background var(--transition-fast);
    }
    .avatar-btn:hover {
      background: var(--accent-hover);
    }
    .dropdown-container {
      position: relative;
    }
    .dropdown-menu {
      position: absolute;
      top: 130%;
      right: 0;
      background: var(--bg-secondary);
      border: 1px solid var(--glass-border);
      border-radius: var(--border-radius);
      width: 200px;
      padding: 0.5rem 0;
      box-shadow: var(--shadow-lg);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all var(--transition-fast);
      z-index: 100;
      flex-direction: column;
    }
    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    .dropdown-header {
      padding: 0.5rem 1rem;
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-weight: 600;
      color: var(--text-primary);
    }
    .user-xp {
      font-size: 0.8rem;
      color: var(--accent-primary);
    }
    .dropdown-divider {
      height: 1px;
      background: var(--glass-border);
      margin: 0.5rem 0;
    }
    .dropdown-item {
      padding: 0.5rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      text-decoration: none;
      cursor: pointer;
      background: transparent;
      border: none;
      width: 100%;
      text-align: left;
      font-family: inherit;
      font-size: 0.95rem;
      transition: background var(--transition-fast), color var(--transition-fast);
    }
    .dropdown-item:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
    .text-danger {
      color: var(--danger);
    }
    .text-danger:hover {
      color: white;
      background: rgba(239, 68, 68, 0.1);
    }
  `
})
export class NavBar {
  auth = inject(AuthService);
  isDropdownOpen = signal(false);

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen.update(v => !v);
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
  }

  logout() {
    this.closeDropdown();
    this.auth.logout();
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.closeDropdown();
  }
}
