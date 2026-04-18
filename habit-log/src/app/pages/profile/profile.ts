import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UpperCasePipe } from '@angular/common';
import { NavBar } from '../../components/nav-bar/nav-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, UpperCasePipe, NavBar],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  authService = inject(AuthService);
  fb = inject(FormBuilder);

  savedMessage = '';

  profileForm = this.fb.group({
    email: [this.authService.currentUser()?.email || '', [Validators.required, Validators.email]],
    username: [this.authService.currentUser()?.username || '', Validators.required]
  });

  updateProfile() {
    if (this.profileForm.valid) {
      const updates = {
        username: this.profileForm.value.username!,
        email: this.profileForm.value.email!
      };

      this.authService.updateProfile(updates).subscribe({
        next: () => {
          this.savedMessage = 'Profile updated successfully!';
          this.profileForm.markAsPristine();
          setTimeout(() => this.savedMessage = '', 3000);
        },
        error: (err) => {
          console.error('Update profile error', err);
          this.savedMessage = 'Failed to update profile.';
          setTimeout(() => this.savedMessage = '', 3000);
        }
      });
    }
  }
}
