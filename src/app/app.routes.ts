import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () => import('./components/auth0/auth0.component').then(m => m.Auth0Component)
  },

];
