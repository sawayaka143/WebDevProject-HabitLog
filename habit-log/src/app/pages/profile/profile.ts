import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, UpperCasePipe],
  template: `
    <div class="container mt-4 mb-4">
      <div class="glass-card" style="max-width: 600px; margin: 0 auto; padding: 2.5rem;">
        <h2 class="mb-4 text-center">Profile Settings</h2>
        
        <div class="text-center mb-4">
          <div class="avatar-placeholder mb-2">
            <span>{{ authService.currentUser()?.username?.[0] | uppercase }}</span>
          </div>
          <h3 class="text-accent">{{ authService.currentUser()?.username }}</h3>
          <p class="text-muted">Level {{ currentLevel }} · {{ authService.currentUser()?.xp }} XP</p>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
          <div class="form-group mb-4">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-control" formControlName="email">
          </div>

          <div class="form-group mb-4">
            <label class="form-label">Username</label>
            <input type="text" class="form-control" formControlName="username">
          </div>

          <button type="submit" class="btn btn-primary w-100" [disabled]="profileForm.invalid || !profileForm.dirty">
            Update Profile
          </button>

          @if (savedMessage) {
            <p class="text-accent text-center mt-4">{{ savedMessage }}</p>
          }
        </form>
      </div>
    </div>
  `,
  styles: `
    .avatar-placeholder {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-secondary), var(--accent-primary));
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      font-weight: 700;
      color: white;
      box-shadow: var(--shadow-glow);
    }
  `
})
export class Profile {
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  
  savedMessage = '';

  get currentLevel() {
    return Math.floor((this.authService.currentUser()?.xp || 0) / 1000) + 1;
  }

  profileForm = this.fb.group({
    email: [this.authService.currentUser()?.email || '', [Validators.required, Validators.email]],
    username: [this.authService.currentUser()?.username || '', Validators.required]
  });

  updateProfile() {
    if (this.profileForm.valid) {
      const user = this.authService.currentUser();
      if (user) {
        this.authService.currentUser.set({
          ...user,
          username: this.profileForm.value.username!,
          email: this.profileForm.value.email!
        });
      }
      this.savedMessage = 'Profile updated successfully!';
      this.profileForm.markAsPristine();
      setTimeout(() => this.savedMessage = '', 3000);
    }
  }
}
