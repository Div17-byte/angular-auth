import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom, of, merge, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { LoginButtonComponent } from '../login-button.component';
import { LogoutButtonComponent } from '../logout-button.component';
import { AuthService } from '@auth0/auth0-angular';
import { ProfileComponent } from '../profile.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth0',
  standalone: true,
  imports: [
    AsyncPipe,
    LogoutButtonComponent,
    LoginButtonComponent,
    NgIf,
    ProfileComponent,
  ],
  templateUrl: './auth0.component.html',
  styleUrls: ['./auth0.component.scss'],
})
export class Auth0Component implements OnInit {
  public isAuthenticated$!: Observable<boolean>;
  user: any | null = null;

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const storedUserRaw = sessionStorage.getItem('auth0_user');
    if (storedUserRaw) {
      console.log('storedUserRaw:', storedUserRaw);
      try {
        this.user = JSON.parse(storedUserRaw);
      } catch {
        this.user = null;
      }
      console.log('this.user:', this.user);
    }

    const localPresent =
      (!!sessionStorage.getItem('auth0_access_token') &&
        !!sessionStorage.getItem('auth0_id_token')) ||
      !!this.user;
    this.isAuthenticated$ = this.auth.isAuthenticated$.pipe(
      startWith(localPresent),
      map((isAuth) => isAuth || localPresent)
    );
    this.auth.user$.subscribe((user) => {
      if (user) {
        this.user = user;
        console.log('this.user:', this.user);
        try {
          sessionStorage.setItem('auth0_user', JSON.stringify(user));
        } catch {}
      }
    });
    this.auth.isAuthenticated$.subscribe(async (isAuth) => {
      console.log('isAuth:', isAuth);
      if (isAuth) {
        this.router.navigate(['/auth0']);
        try {
          const accessToken = await firstValueFrom(
            this.auth.getAccessTokenSilently()
          );
          if (accessToken) {
            sessionStorage.setItem('auth0_access_token', accessToken as string);
          }

          const idClaims = await firstValueFrom(this.auth.idTokenClaims$);
          const rawId = (idClaims as any)?.__raw;
          if (rawId) {
            sessionStorage.setItem('auth0_id_token', rawId);
          }

          // Persist basic user info to aid session restoration
          const user = await firstValueFrom(this.auth.user$);
          if (user) {
            this.user = user;
            try {
              sessionStorage.setItem('auth0_user', JSON.stringify(user));
            } catch {}
          }
        } catch (err) {
          console.error('Auth0: failed to retrieve tokens', err);
        }
      }
    });
  }
}
