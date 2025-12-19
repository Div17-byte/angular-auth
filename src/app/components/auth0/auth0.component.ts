import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Subscription, firstValueFrom, of, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginButtonComponent } from '../login-button.component';
import { LogoutButtonComponent } from '../logout-button.component';
import { AuthService } from '@auth0/auth0-angular';
import { ProfileComponent } from '../profile.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth0',
  standalone: true,
  imports: [AsyncPipe, LogoutButtonComponent, LoginButtonComponent, NgIf, ProfileComponent],
  templateUrl: './auth0.component.html',
  styleUrls: ['./auth0.component.scss']
})
export class Auth0Component  {
  public isAuthenticated$!: Observable<boolean>;

  constructor(public auth: AuthService, private router:Router) {
    const localPresent = !!localStorage.getItem('auth0_access_token') && !!localStorage.getItem('auth0_id_token');
    this.isAuthenticated$ = merge(this.auth.isAuthenticated$, of(localPresent)).pipe(map(Boolean));

    this.auth.isAuthenticated$.subscribe(async (isAuth) => {
         if (isAuth) {
          this.router.navigate(['/auth0']);
           try {
             const accessToken = await firstValueFrom(this.auth.getAccessTokenSilently());
             if (accessToken) {
               localStorage.setItem('auth0_access_token', accessToken as string);
             }

             const idClaims = await firstValueFrom(this.auth.idTokenClaims$);
             const rawId = (idClaims as any)?.__raw;
             if (rawId) {
               localStorage.setItem('auth0_id_token', rawId);
             }
           } catch (err) {
             console.error('Auth0: failed to retrieve tokens', err);
           }
         } else {
          //  localStorage.removeItem('auth0_access_token');
          //  localStorage.removeItem('auth0_id_token');
         }
       });
  }
}
