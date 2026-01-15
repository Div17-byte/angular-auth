import { Component, inject } from '@angular/core';
import { AuthApiService } from '../services/auth-api.service';

@Component({
  selector: 'app-login-button',
  standalone: true,
  template: `
    <button (click)="loginWithRedirect()" class="button login">
      Log In
    </button>
  `,
  styles: []
})
export class LoginButtonComponent {
  private auth = inject(AuthApiService);

  loginWithRedirect(): void {
    this.auth.login()
  }
}
