import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-google-login',
  imports: [CommonModule, RouterModule],
  templateUrl: './google-login.component.html',
  styleUrl: './google-login.component.scss'
})
export class GoogleLoginComponent implements OnInit {
  isLoading = false;
  errorMsg = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Handle callback from Google OAuth
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const refreshToken = params['refreshToken'];

      if (token && refreshToken) {
        this.handleGoogleCallback(token, refreshToken);
      }
    });
  }

  loginWithGoogle(): void {
    this.isLoading = true;
    // Redirect to server Google OAuth endpoint
    window.location.href = 'http://localhost:4000/api/auth/google';
  }

  private handleGoogleCallback(token: string, refreshToken: string): void {
    // Store tokens
    this.authService.setToken(token);
    localStorage.setItem('refresh_token', refreshToken);

    // Redirect to dashboard
    this.router.navigate(['/dashboard']);
  }

  goToRegularLogin(): void {
    this.router.navigate(['/login']);
  }
}

