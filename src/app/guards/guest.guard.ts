import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthApiService } from '../services/auth-api.service';
import { map, catchError, first } from 'rxjs';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(
    private auth: AuthApiService,
    private router: Router,
  ) {}

  canActivate() {
    return this.auth.isAuthenticated().pipe(
      first(),
      map((isAuth) => {
        if (isAuth) {
          // Already authenticated, redirect to dashboard
          this.router.navigate(['/dashboard']);
          return false;
        }
        // Not authenticated, allow access to login page
        return true;
      }),
      catchError(() => {
        // On error, allow access to login page
        return of(true);
      }),
    );
  }
}
