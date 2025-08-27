import { Routes } from '@angular/router';

export const projectRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./project-list/project-list.component').then(m => m.ProjectListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./project-detail/project-detail.component').then(m => m.ProjectDetailComponent)
  },
  {
    path: ':id/kanban',
    loadComponent: () => import('./kanban-board/kanban-board.component').then(m => m.KanbanBoardComponent)
  }
];
