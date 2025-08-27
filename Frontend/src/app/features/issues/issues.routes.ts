import { Routes } from '@angular/router';

export const issueRoutes: Routes = [
  {
    path: ':id',
    loadComponent: () => import('./issue-detail/issue-detail.component').then(m => m.IssueDetailComponent)
  }
];
