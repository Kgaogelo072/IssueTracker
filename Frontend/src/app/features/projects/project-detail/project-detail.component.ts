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
    <div class="container mx-auto px-4 py-6 max-w-7xl">
      <div *ngIf="project" class="space-y-8">
        <!-- Project Header -->
        <div class="bg-base-100 rounded-lg shadow-sm border border-base-300 p-6">
          <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-3">
                <h1 class="text-3xl font-bold text-base-content">{{ project.name }}</h1>
                <div class="font-semibold bg-base-200 rounded-lg px-4 py-2">{{ project.issueCount }} Issues</div>
              </div>
              
              <p class="text-base-content/70 text-lg mb-4 leading-relaxed">
                {{ project.description || 'No description provided' }}
              </p>
              
              <div class="flex flex-wrap items-center gap-4">
                <div class="flex items-center gap-3 bg-base-200 rounded-lg px-4 py-2">
                  <div>
                    <div class="text-sm font-medium text-base-content/60">Project Owner</div>
                    <div class="font-semibold">{{ project.owner.fullName }}</div>
                  </div>
                </div>
                
                <div class="flex items-center gap-2 bg-base-200 rounded-lg px-4 py-2">
                  <svg class="w-5 h-5 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span class="font-semibold">{{ project.members.length }} Members</span>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              <button 
                class="btn btn-outline btn-lg" 
                onclick="edit_project_modal.showModal()"
                *ngIf="isOwner">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit Project
              </button>
              <button class="btn btn-outline btn-lg" [routerLink]="['/projects', project.id, 'kanban']">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
                </svg>
                Open Kanban Board
              </button>
            </div>
          </div>
        </div>

        <!-- Team Members Section -->
        <div class="bg-base-100 rounded-lg shadow-sm border border-base-300">
          <div class="p-6 border-b border-base-300">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 class="text-2xl font-bold text-base-content">Team Members</h2>
                <p class="text-base-content/60 mt-1">Manage project team members and their roles</p>
              </div>
              <button 
                class="btn btn-outline btn-lg" 
                onclick="add_member_modal.showModal()"
                *ngIf="isOwner">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add Member
              </button>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="table table-lg">
              <thead class="bg-base-200">
                <tr>
                  <th class="font-semibold text-base-content">Member</th>
                  <th class="font-semibold text-base-content">Role</th>
                  <th class="font-semibold text-base-content">Joined</th>
                  <th *ngIf="isOwner" class="font-semibold text-base-content">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let member of project.members" class="hover:bg-base-50">
                  <td class="py-4">
                    <div class="flex items-center gap-4">
                      <div>
                        <div class="font-bold text-base-content">{{ member.user.fullName }}</div>
                        <div class="text-sm text-base-content/60">{{ member.user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="py-4">
                    <div class="font-bold text-base-content bg-base-200 rounded-lg px-4 py-2" [class.badge-primary]="member.role === ProjectRole.Admin" [class.badge-outline]="member.role !== ProjectRole.Admin">
                      {{ member.role === ProjectRole.Admin ? 'Admin' : 'Member' }}
                    </div>
                  </td>
                  <td class="py-4 text-base-content/70">{{ member.joinedAt | date:'MMM d, y' }}</td>
                  <td *ngIf="isOwner" class="py-4">
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
      <div class="modal-box max-w-2xl">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-primary/10 rounded-lg">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-base-content">Edit Project</h3>
            <p class="text-base-content/60">Update project information and settings</p>
          </div>
        </div>
        
        <form [formGroup]="editProjectForm" (ngSubmit)="onEditProject()" class="space-y-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Project Name</span>
              <span class="label-text-alt text-error" *ngIf="editProjectForm.get('name')?.invalid && editProjectForm.get('name')?.touched">Required</span>
            </label>
            <input 
              type="text" 
              formControlName="name"
              class="input input-bordered input-lg" 
              placeholder="Enter project name"
              [class.input-error]="editProjectForm.get('name')?.invalid && editProjectForm.get('name')?.touched" />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Description</span>
              <span class="label-text-alt">Optional</span>
            </label>
            <textarea 
              formControlName="description"
              class="textarea textarea-bordered textarea-lg" 
              placeholder="Enter project description"
              rows="4"></textarea>
          </div>

          <div class="modal-action pt-4">
            <button type="button" class="btn btn-outline btn-lg" onclick="edit_project_modal.close()">Cancel</button>
            <button 
              type="submit" 
              class="btn btn-outline btn-lg"
              [disabled]="editProjectForm.invalid || isUpdating">
              <span *ngIf="isUpdating" class="loading loading-spinner loading-sm mr-2"></span>
              {{ isUpdating ? 'Updating...' : 'Update Project' }}
            </button>
          </div>
        </form>
      </div>
    </dialog>

    <!-- Add Member Modal -->
    <dialog id="add_member_modal" class="modal">
      <div class="modal-box border border-base-300 max-w-2xl">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-primary/10 rounded-lg">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-base-content">Add Team Member</h3>
            <p class="text-base-content/60">Invite a new member to join this project</p>
          </div>
        </div>
        
        <form [formGroup]="addMemberForm" (ngSubmit)="onAddMember()" class="space-y-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Email Address</span>
              <span class="label-text-alt text-error" *ngIf="addMemberForm.get('email')?.invalid && addMemberForm.get('email')?.touched">Valid email required</span>
            </label>
            <input 
              type="email" 
              formControlName="email"
              class="input input-bordered input-lg" 
              placeholder="Enter member's email address"
              [class.input-error]="addMemberForm.get('email')?.invalid && addMemberForm.get('email')?.touched" />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Role</span>
              <span class="label-text-alt">Choose member permissions</span>
            </label>
            <select formControlName="role" class="select select-bordered select-lg">
              <option [value]="ProjectRole.Member">Member - Can view and create issues</option>
              <option [value]="ProjectRole.Admin">Admin - Full project access</option>
            </select>
          </div>

          <div *ngIf="addMemberError" class="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ addMemberError }}</span>
          </div>

          <div class="modal-action pt-4">
            <button type="button" class="btn btn-outline btn-lg" onclick="add_member_modal.close()">Cancel</button>
            <button 
              type="submit" 
              class="btn btn-outline btn-lg"
              [disabled]="addMemberForm.invalid || isAddingMember">
              <span *ngIf="isAddingMember" class="loading loading-spinner loading-sm mr-2"></span>
              {{ isAddingMember ? 'Adding...' : 'Add Member' }}
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
