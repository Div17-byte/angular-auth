import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'oauth-login',
    loadComponent: () => import('./components/oauth-login/oauth-login.component').then(m => m.OAuthLoginComponent)
  },
  {
    path: 'auth0',
    loadComponent: () => import('./components/auth0/auth0.component').then(m => m.Auth0Component)
  },
  {
    path: 'google-login',
    loadComponent: () => import('./components/google-login/google-login.component').then(m => m.GoogleLoginComponent)
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./components/google-login/google-login.component').then(m => m.GoogleLoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  }
];
