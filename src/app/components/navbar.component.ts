import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthApiService } from '../services/auth-api.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">
      <div class="navbar-content">
        <div class="navbar-brand">
          <span class="brand-logo">🎬</span>
          <span class="brand-title">MovieDB</span>
        </div>

        <div class="navbar-actions">
          <button class="theme-toggle" (click)="toggleTheme()" [title]="isDarkMode ? 'Light Mode' : 'Dark Mode'">
            <span *ngIf="isDarkMode">☀️</span>
            <span *ngIf="!isDarkMode">🌙</span>
          </button>

          <div class="navbar-profile">
            <button class="profile-button" (click)="toggleDropdown()">
              <img [src]="userAvatar" [alt]="userName" class="avatar" />
              <span class="username">{{ userName }}</span>
              <span class="dropdown-icon" [class.open]="isDropdownOpen">▼</span>
            </button>

            <div class="dropdown-menu" *ngIf="isDropdownOpen">
              <button class="dropdown-item" (click)="closeDropdown()">
                <span class="item-icon">👤</span>
                <span>{{ userName }}</span>
              </button>
              <hr class="dropdown-divider" />
              <button class="dropdown-item logout" (click)="logout()">
                <span class="item-icon">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(90deg, #6200ee, #7c3aed);
      box-shadow: 0 2px 8px rgba(98, 0, 238, 0.15);
      position: sticky;
      top: 0;
      z-index: 100;
      transition: background 0.3s ease, box-shadow 0.3s ease;
    }

    :root.dark-theme .navbar {
      background: linear-gradient(90deg, #5a189a, #7209b7);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .navbar-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: white;
      font-weight: 700;
      font-size: 1.2rem;
    }

    .brand-logo {
      font-size: 1.5rem;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .theme-toggle {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .theme-toggle:hover {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.4);
    }

    .navbar-profile {
      position: relative;
    }

    .profile-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: white;
      padding: 0.4rem 0.75rem 0.4rem 0.4rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.95rem;
    }

    .profile-button:hover {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.4);
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255, 255, 255, 0.4);
    }

    .username {
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dropdown-icon {
      font-size: 0.7rem;
      transition: transform 0.2s ease;
    }

    .dropdown-icon.open {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      min-width: 200px;
      overflow: hidden;
      animation: slideDown 0.2s ease;
      transition: background 0.3s ease;
    }

    :root.dark-theme .dropdown-menu {
      background: #1f2937;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown-item {
      width: 100%;
      text-align: left;
      padding: 0.75rem 1rem;
      border: none;
      background: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #0f172a;
      transition: background-color 0.15s ease, color 0.3s ease;
      font-size: 0.95rem;
    }

    :root.dark-theme .dropdown-item {
      color: #f3f4f6;
    }

    .dropdown-item:hover {
      background-color: #f6f7fb;
    }

    :root.dark-theme .dropdown-item:hover {
      background-color: #374151;
    }

    .dropdown-item.logout {
      color: #ef4444;
    }

    .dropdown-item.logout:hover {
      background-color: #fee2e2;
    }

    :root.dark-theme .dropdown-item.logout:hover {
      background-color: rgba(239, 68, 68, 0.1);
    }

    .item-icon {
      font-size: 1rem;
      width: 20px;
      text-align: center;
    }

    .dropdown-divider {
      margin: 0.5rem 0;
      border: none;
      border-top: 1px solid #e5e7eb;
      transition: border-color 0.3s ease;
    }

    :root.dark-theme .dropdown-divider {
      border-top: 1px solid #374151;
    }

    @media (max-width: 640px) {
      .navbar-content {
        padding: 0.5rem 1rem;
      }

      .brand-title {
        display: none;
      }

      .username {
        display: none;
      }

      .dropdown-menu {
        right: -10px;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  isDropdownOpen = false;
  isDarkMode = false;
  userName = '';
  userAvatar = '';

  constructor(
    private auth: AuthApiService,
    private router: Router,
    private theme: ThemeService
  ) {
    this.auth.getUser().subscribe((user) => {
      if (user) {
        this.userName = user.name || user.email || 'User';
        this.userAvatar = user.picture || 'https://via.placeholder.com/32';
      }
    });
  }

  ngOnInit() {
    this.theme.darkMode$.subscribe((isDark) => {
      this.isDarkMode = isDark;
    });
  }

  toggleTheme() {
    this.theme.toggleTheme();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  logout() {
    this.closeDropdown();
    this.auth.logout();
  }
}
