import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthApiService } from '../services/auth-api.service';
import { map, catchError, first } from 'rxjs';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthApiService, private router: Router) {}

  canActivate() {
    return this.auth.isAuthenticated().pipe(
      first(),
      map((isAuth) => {
        console.log('[AuthGuard] Auth check result:', isAuth);
        if (!isAuth) {
          console.log('[AuthGuard] Not authenticated, redirecting to home');
          this.router.navigate(['/']);
          return false;
        }
        console.log('[AuthGuard] Authenticated, allowing access');
        return true;
      }),
      catchError((err) => {
        console.error('[AuthGuard] Auth check error:', err);
        this.router.navigate(['/']);
        return of(false);
      })
    );
  }
}
