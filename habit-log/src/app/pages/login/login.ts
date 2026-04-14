import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="container d-flex flex-column justify-center align-center" style="min-height: calc(100vh - 70px);">
      <div class="text-center mb-4">
        <h1 class="text-accent" style="font-size: 3rem; margin-bottom: 0.5rem;">HabitLog</h1>
        <p class="text-muted" style="font-size: 1.2rem;">Gamify your daily routines</p>
      </div>
      <div class="glass-card" style="width: 100%; max-width: 400px; padding: 2.5rem;">
        <h2 class="text-center mb-4">Welcome Back</h2>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" class="form-control" formControlName="username" placeholder="Enter username">
          </div>
          
          <div class="form-group mb-4">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" formControlName="password" placeholder="Enter password">
          </div>
          
          <button type="submit" class="btn btn-primary w-100" [disabled]="loginForm.invalid">
            Login to Start Gaining XP
          </button>
        </form>
      </div>
    </div>
  `
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.auth.login(this.loginForm.value.username!);
      this.router.navigate(['/dashboard']);
    }
  }
}
