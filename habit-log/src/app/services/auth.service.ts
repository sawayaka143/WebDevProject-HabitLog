import { Injectable, signal } from '@angular/core';

export interface User {
  id: number;
  username: string;
  email: string;
  xp: number;
  level: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Use Angular 17+ signals for reactive state
  currentUser = signal<User | null>(null);

  constructor() {
    // Mock check for existing token in localStorage
    const savedUser = localStorage.getItem('habitlog_user');
    if (savedUser) {
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  login(username: string) {
    // Mock login logic
    const mockUser: User = {
      id: 1,
      username: username,
      email: `${username.toLowerCase()}@example.com`,
      xp: 1540,
      level: 12
    };
    this.currentUser.set(mockUser);
    localStorage.setItem('habitlog_user', JSON.stringify(mockUser));
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('habitlog_user');
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}
