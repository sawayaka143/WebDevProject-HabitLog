import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { IdeStateService } from '../../services/ide-state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private ideState = inject(IdeStateService);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.auth.login(username!, password!).subscribe({
        next: () => {
          this.ideState.initializeAfterLogin();

          const redirectTo =
            this.route.snapshot.queryParamMap.get('redirectTo') || '/dashboard';

          this.router.navigateByUrl(redirectTo);
        },
        error: (err) => {
          console.error('Login failed', err);
          alert('Неверный логин или пароль');
        }
      });
    }
  }
}