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
  currentUser = signal<User | null>(null);

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const savedUser = localStorage.getItem('habitlog_user');
      if (savedUser) {
        this.currentUser.set(JSON.parse(savedUser));
      }
    }
  }

  login(username: string) {
    const mockUser: User = {
      id: 1,
      username: username,
      email: `${username.toLowerCase()}@example.com`,
      xp: 1540,
      level: 12
    };
    this.currentUser.set(mockUser);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('habitlog_user', JSON.stringify(mockUser));
    }
  }

  logout() {
    this.currentUser.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('habitlog_user');
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}
