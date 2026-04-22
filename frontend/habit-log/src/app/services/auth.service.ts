import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  id: number;
  username: string;
  email: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1/auth';
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient) {
    if (typeof localStorage !== 'undefined') {
      const savedUser = localStorage.getItem('habitlog_user');
      if (savedUser) {
        this.currentUser.set(JSON.parse(savedUser));
      }
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/`, {
      username,
      password
    }).pipe(
      tap((response) => {
        this.currentUser.set(response.user);

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('habitlog_user', JSON.stringify(response.user));
          localStorage.setItem('token', response.token);
        }
      })
    );
  }

  updateProfile(updates: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/profile/`, updates, {
      headers: this.getHeaders()
    }).pipe(
      tap((updatedUser) => {
        this.currentUser.set(updatedUser);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('habitlog_user', JSON.stringify(updatedUser));
        }
      })
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password/`, {
      old_password: oldPassword,
      new_password: newPassword
    }, {
      headers: this.getHeaders()
    });
  }

  logout() {
    this.currentUser.set(null);

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('habitlog_user');
      localStorage.removeItem('token');
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }
}