import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-oauth-login',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './oauth-login.component.html',
  styleUrl: './oauth-login.component.scss'
})
export class OAuthLoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMsg = '';
      const { email, password } = this.loginForm.value;

      this.authService.loginWithOAuth(email, password).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMsg = err.error?.error_description || err.error?.error || 'Login failed';
        }
      });
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }


}

