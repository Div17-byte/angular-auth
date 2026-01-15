import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, startWith } from 'rxjs';

const API_BASE = 'http://localhost:3000';
const FRONTEND_ORIGIN = window.location?.origin || 'http://localhost:4200';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(private http: HttpClient) {}

  isAuthenticated(): Observable<boolean> {
    return this.http.get<{ authenticated: boolean }>(`${API_BASE}/auth/status`, { withCredentials: true }).pipe(
      map(r => !!r.authenticated),
      startWith(false)
    );
  }

  getUser(): Observable<any | null> {
    return this.http.get<{ authenticated: boolean; user?: any }>(`${API_BASE}/auth/status`, { withCredentials: true }).pipe(
      map(r => (r && r.authenticated ? r.user ?? null : null))
    );
  }

  // trigger login via server route
  login(): void {
    // redirect the browser to the Node server login route
    globalThis.location.href = `${API_BASE}/login`;
  }

  // fetch tokens from the server after the callback redirect (frontend should call this)
  fetchTokens(): Observable<{ accessToken?: string; idToken?: string }>{
    return this.http.get<{ accessToken?: string; idToken?: string }>(`${API_BASE}/auth/token`, { withCredentials: true });
  }

  // store tokens in browser storage
  saveTokens(tokens: { accessToken?: string | null; idToken?: string | null }): void {
    if (tokens.accessToken) {
      localStorage.setItem('auth_access_token', tokens.accessToken);
    }
    if (tokens.idToken) {
      localStorage.setItem('auth_id_token', tokens.idToken);
    }
  }

  // trigger logout via server route
  logout(): void {
    // call server to get the Auth0 logout URL, then redirect browser there
    const returnTo = FRONTEND_ORIGIN;
    this.http.get<{ logoutUrl: string }>(`${API_BASE}/auth/logout-url?returnTo=${encodeURIComponent(returnTo)}`, { withCredentials: true })
      .subscribe({
        next: (r) => {
          if (r?.logoutUrl) {
            globalThis.location.href = r.logoutUrl;
          } else {
            // fallback to server-side logout redirect
            globalThis.location.href = `${API_BASE}/logout?returnTo=${encodeURIComponent(returnTo)}`;
          }
        },
        error: () => {
          globalThis.location.href = `${API_BASE}/logout?returnTo=${encodeURIComponent(returnTo)}`;
        }
      });
  }
}
