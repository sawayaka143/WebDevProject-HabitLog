import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, UpperCasePipe],
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
