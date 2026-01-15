import { AsyncPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginButtonComponent } from '../login-button.component';
import { LogoutButtonComponent } from '../logout-button.component';
import { AuthApiService } from '../../services/auth-api.service';
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

  constructor(public auth: AuthApiService, private router:Router) {
    this.isAuthenticated$ = this.auth.isAuthenticated();
  }
}
