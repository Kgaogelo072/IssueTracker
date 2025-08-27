import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/projects',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadChildren: () => import('./features/projects/projects.routes').then(m => m.projectRoutes)
  },
  {
    path: 'issues',
    canActivate: [authGuard],
    loadChildren: () => import('./features/issues/issues.routes').then(m => m.issueRoutes)
  },
  {
    path: '**',
    redirectTo: '/projects'
  }
];
