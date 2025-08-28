import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { Project, CreateProjectRequest } from '../../../core/models';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Projects</h1>
      <button class="btn btn-primary" onclick="create_project_modal.showModal()">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        New Project
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="projects.length > 0">
      <div *ngFor="let project of projects" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
        <div class="card-body">
          <h2 class="card-title">{{ project.name }}</h2>
          <p class="text-base-content/70">{{ project.description || 'No description' }}</p>
          
          <div class="flex items-center gap-2 mt-2">
            <span class="text-sm text-base-content/70">{{ project.owner.fullName }}</span>
          </div>

          <div class="flex justify-between items-center mt-4">
            <div class="flex gap-2">
              <div class="badge badge-outline">{{ project.issueCount }} issues</div>
              <div class="badge badge-outline">{{ project.members.length }} members</div>
            </div>
            <div class="card-actions">
              <button class="btn btn-sm btn-ghost" [routerLink]="['/projects', project.id]">
                View
              </button>
              <button class="btn btn-sm btn-primary" [routerLink]="['/projects', project.id, 'kanban']">
                Kanban
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="projects.length === 0 && !isLoading" class="text-center py-12">
      <div class="text-6xl mb-4">📋</div>
      <h3 class="text-xl font-semibold mb-2">No projects yet</h3>
      <p class="text-base-content/70 mb-4">Create your first project to get started</p>
      <button class="btn btn-primary" onclick="create_project_modal.showModal()">
        Create Project
      </button>
    </div>

    <div *ngIf="isLoading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Create Project Modal -->
    <dialog id="create_project_modal" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="font-bold text-lg mb-4">Create New Project</h3>
        
        <form [formGroup]="createProjectForm" (ngSubmit)="onCreateProject()">
          <div class="form-control w-full mb-4">
            <label class="label">
              <span class="label-text">Project Name</span>
            </label>
            <input 
              type="text" 
              placeholder="Enter project name" 
              class="input input-bordered w-full"
              [class.input-error]="createProjectForm.get('name')?.invalid && createProjectForm.get('name')?.touched"
              formControlName="name">
            <label class="label" *ngIf="createProjectForm.get('name')?.invalid && createProjectForm.get('name')?.touched">
              <span class="label-text-alt text-error">Project name is required</span>
            </label>
          </div>

          <div class="form-control w-full mb-6">
            <label class="label">
              <span class="label-text">Description</span>
            </label>
            <textarea 
              placeholder="Enter project description (optional)" 
              class="textarea textarea-bordered w-full"
              formControlName="description"
              rows="3"></textarea>
          </div>

          <div class="alert alert-error mb-4" *ngIf="createErrorMessage">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ createErrorMessage }}</span>
          </div>

          <div class="modal-action">
            <button type="button" class="btn" onclick="create_project_modal.close()">Cancel</button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [class.loading]="isCreating"
              [disabled]="createProjectForm.invalid || isCreating">
              <span *ngIf="!isCreating">Create Project</span>
              <span *ngIf="isCreating">Creating...</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  `,
  styles: []
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  isLoading = false;
  isCreating = false;
  createErrorMessage = '';
  createProjectForm: FormGroup;

  constructor(
    private projectService: ProjectService,
    private fb: FormBuilder
  ) {
    this.createProjectForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.isLoading = true;
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.isLoading = false;
      }
    });
  }

  onCreateProject() {
    if (this.createProjectForm.valid) {
      this.isCreating = true;
      this.createErrorMessage = '';
      
      const request: CreateProjectRequest = this.createProjectForm.value;
      
      this.projectService.createProject(request).subscribe({
        next: (project) => {
          this.projects.unshift(project);
          this.createProjectForm.reset();
          this.isCreating = false;
          // Close modal
          (document.getElementById('create_project_modal') as any)?.close();
        },
        error: (error) => {
          this.isCreating = false;
          this.createErrorMessage = error.error?.message || 'Failed to create project. Please try again.';
        }
      });
    }
  }
}
