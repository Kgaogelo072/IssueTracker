import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project, ProjectRole, AddMemberRequest, UpdateProjectRequest } from '../../../core/models';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div *ngIf="project" class="space-y-6">
      <!-- Project Header -->
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold">{{ project.name }}</h1>
          <p class="text-base-content/70 mt-2">{{ project.description || 'No description' }}</p>
          <div class="flex items-center gap-4 mt-4">
            <div class="flex items-center gap-2">
              <div class="avatar">
                <div class="w-8 h-8 rounded-full bg-primary text-primary-content text-sm flex items-center justify-center">
                  {{ project.owner.firstName.charAt(0) }}{{ project.owner.lastName.charAt(0) }}
                </div>
              </div>
              <span class="text-sm">Owner: {{ project.owner.fullName }}</span>
            </div>
            <div class="badge badge-outline">{{ project.issueCount }} issues</div>
            <div class="badge badge-outline">{{ project.members.length }} members</div>
          </div>
        </div>
        <div class="flex gap-2">
          <button 
            class="btn btn-outline" 
            onclick="edit_project_modal.showModal()"
            *ngIf="isOwner">
            Edit Project
          </button>
          <button class="btn btn-primary" [routerLink]="['/projects', project.id, 'kanban']">
            Open Kanban Board
          </button>
        </div>
      </div>

      <!-- Members Section -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex justify-between items-center mb-4">
            <h2 class="card-title">Team Members</h2>
            <button 
              class="btn btn-sm btn-primary" 
              onclick="add_member_modal.showModal()"
              *ngIf="isOwner">
              Add Member
            </button>
          </div>
          
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th *ngIf="isOwner">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let member of project.members">
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="avatar">
                        <div class="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                          {{ member.user.firstName.charAt(0) }}{{ member.user.lastName.charAt(0) }}
                        </div>
                      </div>
                      <div>
                        <div class="font-bold">{{ member.user.fullName }}</div>
                        <div class="text-sm opacity-50">{{ member.user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="badge" [class.badge-primary]="member.role === ProjectRole.Admin">
                      {{ member.role === ProjectRole.Admin ? 'Admin' : 'Member' }}
                    </div>
                  </td>
                  <td>{{ member.joinedAt | date:'short' }}</td>
                  <td *ngIf="isOwner">
                    <button 
                      class="btn btn-sm btn-error btn-outline"
                      (click)="removeMember(member.id)"
                      *ngIf="member.user.id !== currentUser?.id">
                      Remove
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="isLoading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Edit Project Modal -->
    <dialog id="edit_project_modal" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="font-bold text-lg mb-4">Edit Project</h3>
        
        <form [formGroup]="editProjectForm" (ngSubmit)="onEditProject()">
          <div class="form-control w-full mb-4">
            <label class="label">
              <span class="label-text">Project Name</span>
            </label>
            <input 
              type="text" 
              placeholder="Enter project name" 
              class="input input-bordered w-full"
              formControlName="name">
          </div>

          <div class="form-control w-full mb-6">
            <label class="label">
              <span class="label-text">Description</span>
            </label>
            <textarea 
              placeholder="Enter project description" 
              class="textarea textarea-bordered w-full"
              formControlName="description"
              rows="3"></textarea>
          </div>

          <div class="modal-action">
            <button type="button" class="btn" onclick="edit_project_modal.close()">Cancel</button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="editProjectForm.invalid || isUpdating">
              Update Project
            </button>
          </div>
        </form>
      </div>
    </dialog>

    <!-- Add Member Modal -->
    <dialog id="add_member_modal" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="font-bold text-lg mb-4">Add Team Member</h3>
        
        <form [formGroup]="addMemberForm" (ngSubmit)="onAddMember()">
          <div class="form-control w-full mb-4">
            <label class="label">
              <span class="label-text">Email Address</span>
            </label>
            <input 
              type="email" 
              placeholder="Enter member's email" 
              class="input input-bordered w-full"
              formControlName="email">
          </div>

          <div class="form-control w-full mb-6">
            <label class="label">
              <span class="label-text">Role</span>
            </label>
            <select class="select select-bordered w-full" formControlName="role">
              <option [value]="ProjectRole.Member">Member</option>
              <option [value]="ProjectRole.Admin">Admin</option>
            </select>
          </div>

          <div class="alert alert-error mb-4" *ngIf="addMemberError">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ addMemberError }}</span>
          </div>

          <div class="modal-action">
            <button type="button" class="btn" onclick="add_member_modal.close()">Cancel</button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="addMemberForm.invalid || isAddingMember">
              Add Member
            </button>
          </div>
        </form>
      </div>
    </dialog>
  `,
  styles: []
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  projectId!: number;
  isLoading = false;
  isUpdating = false;
  isAddingMember = false;
  addMemberError = '';
  
  editProjectForm: FormGroup;
  addMemberForm: FormGroup;
  
  ProjectRole = ProjectRole;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.editProjectForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]]
    });

    this.addMemberForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: [ProjectRole.Member]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.projectId = +params['id'];
      this.loadProject();
    });
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get isOwner() {
    return this.project?.owner.id === this.currentUser?.id;
  }

  loadProject() {
    this.isLoading = true;
    this.projectService.getProject(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        this.editProjectForm.patchValue({
          name: project.name,
          description: project.description
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.isLoading = false;
      }
    });
  }

  onEditProject() {
    if (this.editProjectForm.valid && this.project) {
      this.isUpdating = true;
      
      const request: UpdateProjectRequest = this.editProjectForm.value;
      
      this.projectService.updateProject(this.project.id, request).subscribe({
        next: (updatedProject) => {
          this.project = updatedProject;
          this.isUpdating = false;
          (document.getElementById('edit_project_modal') as any)?.close();
        },
        error: (error) => {
          console.error('Error updating project:', error);
          this.isUpdating = false;
        }
      });
    }
  }

  onAddMember() {
    if (this.addMemberForm.valid && this.project) {
      this.isAddingMember = true;
      this.addMemberError = '';
      
      const request: AddMemberRequest = this.addMemberForm.value;
      
      this.projectService.addMember(this.project.id, request).subscribe({
        next: () => {
          this.loadProject(); // Reload to get updated member list
          this.addMemberForm.reset({ role: ProjectRole.Member });
          this.isAddingMember = false;
          (document.getElementById('add_member_modal') as any)?.close();
        },
        error: (error) => {
          this.isAddingMember = false;
          this.addMemberError = error.error?.message || 'Failed to add member. Please try again.';
        }
      });
    }
  }

  removeMember(memberId: number) {
    if (this.project && confirm('Are you sure you want to remove this member?')) {
      this.projectService.removeMember(this.project.id, memberId).subscribe({
        next: () => {
          this.loadProject(); // Reload to get updated member list
        },
        error: (error) => {
          console.error('Error removing member:', error);
        }
      });
    }
  }
}
