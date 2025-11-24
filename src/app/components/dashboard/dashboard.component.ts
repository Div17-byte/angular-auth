import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  userEmail: string | null = null;

  constructor(private readonly auth: AuthService) {
    // In a real app, decode JWT or fetch user info
    const token = this.auth.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userEmail = payload.email;
      } catch {
        this.userEmail = null;
      }
    }

    this.auth.getDashboard().subscribe({
      next: (res) => {
        console.log('Dashboard data:', res);
  }})
  }
  logout() {
    this.auth.logout();
  }
}
