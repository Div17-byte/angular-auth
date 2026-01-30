import { Component, inject } from '@angular/core';
import { AuthApiService } from '../services/auth-api.service';

@Component({
  selector: 'app-login-button',
  standalone: true,
  template: `
    <button (click)="loginWithRedirect()" class="login-button">
      <span class="button-icon">🔐</span>
      <span class="button-text">Sign In with Auth0</span>
    </button>
  `,
  styles: [
    `
      .login-button {
        width: 100%;
        padding: 0.875rem 1.5rem;
        background: linear-gradient(135deg, #6200ee, #7c3aed);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        box-shadow: 0 4px 12px rgba(98, 0, 238, 0.25);
      }

      .login-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(98, 0, 238, 0.35);
      }

      .login-button:active {
        transform: translateY(0);
      }

      .button-icon {
        font-size: 1.1rem;
      }

      .button-text {
        letter-spacing: 0.3px;
      }

      @media (max-width: 480px) {
        .login-button {
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
        }
      }
    `,
  ],
})
export class LoginButtonComponent {
  private auth = inject(AuthApiService);

  loginWithRedirect(): void {
    this.auth.login();
  }
}
