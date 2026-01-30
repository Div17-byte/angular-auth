import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, startWith } from 'rxjs';

const API_BASE = 'http://localhost:3000';
const FRONTEND_ORIGIN = window.location?.origin || 'http://localhost:4200';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(private http: HttpClient) {}

  isAuthenticated(): Observable<boolean> {
    return this.http
      .get<{ authenticated: boolean }>(`${API_BASE}/auth/status`, {
        withCredentials: true,
      })
      .pipe(map((r) => !!r.authenticated));
  }

  getUser(): Observable<any | null> {
    return this.http
      .get<{ authenticated: boolean; user?: any }>(`${API_BASE}/auth/status`, {
        withCredentials: true,
      })
      .pipe(map((r) => (r && r.authenticated ? (r.user ?? null) : null)));
  }

  login(): void {
    globalThis.location.href = `${API_BASE}/login`;
  }

  fetchTokens(): Observable<{ accessToken?: string; idToken?: string }> {
    return this.http.get<{ accessToken?: string; idToken?: string }>(
      `${API_BASE}/auth/token`,
      { withCredentials: true },
    );
  }

  saveTokens(tokens: {
    accessToken?: string | null;
    idToken?: string | null;
  }): void {
    if (tokens.accessToken) {
      localStorage.setItem('auth_access_token', tokens.accessToken);
    }
    if (tokens.idToken) {
      localStorage.setItem('auth_id_token', tokens.idToken);
    }
  }

  logout(): void {
    const returnTo = FRONTEND_ORIGIN;
    this.http
      .get<{
        logoutUrl: string;
      }>(`${API_BASE}/auth/logout-url?returnTo=${encodeURIComponent(returnTo)}`, { withCredentials: true })
      .subscribe({
        next: (r) => {
          if (r?.logoutUrl) {
            globalThis.location.href = r.logoutUrl;
          } else {
            globalThis.location.href = `${API_BASE}/logout?returnTo=${encodeURIComponent(
              returnTo,
            )}`;
          }
        },
        error: () => {
          globalThis.location.href = `${API_BASE}/logout?returnTo=${encodeURIComponent(
            returnTo,
          )}`;
        },
      });
  }
}
