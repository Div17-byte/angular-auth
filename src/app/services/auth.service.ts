import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:4000/api';
  private isRefreshing = false;

  constructor(private readonly http: HttpClient, private router: Router) {}

  register(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, { email, password }).pipe(
      tap(response => {
        this.setTokens(response.token, response.refreshToken);
      })
    );
  }

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(response => {
        this.setTokens(response.token, response.refreshToken);
      })
    );
  }

  refreshAccessToken(): Observable<{ token: string }> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<{ token: string }>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.setToken(response.token);
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  // OAuth 2.0 Login (Password Grant)
  loginWithOAuth(email: string, password: string): Observable<any> {
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('username', email);
    body.set('password', password);
    body.set('client_id', 'angular-app');
    body.set('client_secret', 'angular-secret');
    body.set('scope', 'read write');

    return this.http.post<any>(`http://localhost:4000/oauth/token`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap(response => {
        // Store OAuth tokens
        localStorage.setItem('oauth_access_token', response.access_token);
        localStorage.setItem('oauth_refresh_token', response.refresh_token);
        localStorage.setItem('oauth_token_type', response.token_type);
      })
    );
  }

  // OAuth 2.0 Refresh Token
  refreshOAuthToken(): Observable<any> {
    const refreshToken = this.getOAuthRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No OAuth refresh token available'));
    }

    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', refreshToken);
    body.set('client_id', 'angular-app');
    body.set('client_secret', 'angular-secret');

    return this.http.post<any>(`http://localhost:4000/oauth/token`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap(response => {
        localStorage.setItem('oauth_access_token', response.access_token);
        localStorage.setItem('oauth_refresh_token', response.refresh_token);
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  getOAuthAccessToken(): string | null {
    return localStorage.getItem('oauth_access_token');
  }

  getOAuthRefreshToken(): string | null {
    return localStorage.getItem('oauth_refresh_token');
  }

  isOAuthLogin(): boolean {
    return !!this.getOAuthAccessToken();
  }

  setTokens(token: string, refreshToken: string): void {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('refresh_token', refreshToken);
  }

  setToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  logout(): void {
    this.router.navigate(['/']);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('oauth_access_token');
    localStorage.removeItem('oauth_refresh_token');
    localStorage.removeItem('oauth_token_type');
  }

  setIsRefreshing(value: boolean): void {
    this.isRefreshing = value;
  }

  getIsRefreshing(): boolean {
    return this.isRefreshing;
  }
}
