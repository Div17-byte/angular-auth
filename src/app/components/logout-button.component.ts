import { Component, inject } from '@angular/core';
import { AuthApiService } from '../services/auth-api.service';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  template: `
    <button (click)="logout()" class="button logout">
      Log Out
    </button>
  `,
  styles: []
})
export class LogoutButtonComponent {
  private auth = inject(AuthApiService);

  logout(): void {
    localStorage.clear();
    this.auth.logout();
  }
}
