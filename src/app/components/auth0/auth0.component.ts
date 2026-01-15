import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginButtonComponent } from '../login-button.component';
import { AuthApiService } from '../../services/auth-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth0',
  standalone: true,
  imports: [LoginButtonComponent],
  templateUrl: './auth0.component.html',
  styleUrls: ['./auth0.component.scss']
})
export class Auth0Component implements OnInit {
  public isAuthenticated$!: Observable<boolean>;

  constructor(public auth: AuthApiService, private readonly router: Router) {
    this.isAuthenticated$ = this.auth.isAuthenticated();
  }

  ngOnInit() {
    // Add a small delay to allow Auth0 callback to complete
    setTimeout(() => {
      this.auth.isAuthenticated().subscribe((isAuth) => {
        if (isAuth) {
          console.log('User authenticated, navigating to dashboard');
          this.router.navigate(['/dashboard']);
        }
      });
    }, 500);
  }
}
