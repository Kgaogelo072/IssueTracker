import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IssueService } from '../../../core/services/issue.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { Issue, Comment, CreateCommentRequest, UpdateIssueRequest, IssueStatus, IssuePriority, IssueType, ProjectMember } from '../../../core/models';

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div *ngIf="issue" class="max-w-4xl mx-auto space-y-8">
      <!-- Issue Header -->
      <div class="card bg-base-100 shadow-xl border border-base-300">
        <div class="card-body p-8">
          <div class="flex justify-between items-start mb-6">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-4">
                <div class="badge badge-outline badge-lg">{{ getTypeText(issue.type) }}</div>
                <div class="badge badge-lg" [ngClass]="getPriorityClass(issue.priority)">
                  {{ getPriorityText(issue.priority) }}
                </div>
                <div class="badge badge-lg" [ngClass]="getStatusClass(issue.status)">
                  {{ getStatusText(issue.status) }}
                </div>
              </div>
              <h1 class="text-3xl font-bold text-base-content mb-4">{{ issue.title }}</h1>
              <p class="text-base-content/70 text-lg leading-relaxed">{{ issue.description }}</p>
            </div>
            <div class="flex gap-3">
              <button class="btn btn-outline btn-lg" (click)="openEditModal()">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit Issue
              </button>
              <button class="btn btn-outline btn-lg" [routerLink]="['/projects', issue.projectId, 'kanban']">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to Board
              </button>
            </div>
          </div>

          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-6 border-t border-base-300">
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-base-content/70">Created by:</span>
                <span class="text-sm font-semibold text-base-content">{{ issue.creator.fullName }}</span>
              </div>
              <div class="text-sm text-base-content/60">
                {{ issue.createdAt | date:'medium' }}
              </div>
            </div>
            
            <div class="flex items-center gap-3" *ngIf="issue.assignees.length > 0">
              <span class="text-sm font-medium text-base-content/70">Assigned to:</span>
              <div class="flex -space-x-2">
                <div 
                  *ngFor="let assignee of issue.assignees" 
                  class="avatar tooltip"
                  [attr.data-tip]="assignee.fullName">
                  <div class="w-10 h-10 rounded-full bg-primary text-primary-content text-sm flex items-center justify-center font-semibold border-2 border-base-100">
                    {{ assignee.firstName.charAt(0) }}{{ assignee.lastName.charAt(0) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Comments Section -->
      <div class="card bg-base-100 shadow-xl border border-base-300">
        <div class="card-body p-8">
          <h2 class="card-title text-2xl mb-6">Comments ({{ issue.comments.length }})</h2>
          
          <!-- Add Comment Form -->
          <form [formGroup]="commentForm" (ngSubmit)="onAddComment()" class="mb-8">
            <div class="form-control w-full mb-4">
              <textarea 
                placeholder="Add a comment..." 
                class="textarea textarea-bordered w-full text-base-content bg-base-200 border-base-300"
                formControlName="content"
                rows="4"></textarea>
            </div>
            <div class="flex justify-end">
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="commentForm.invalid || isAddingComment">
                <span *ngIf="!isAddingComment">Add Comment</span>
                <span *ngIf="isAddingComment" class="loading loading-spinner loading-sm"></span>
              </button>
            </div>
          </form>

          <!-- Comments List -->
          <div class="space-y-6" *ngIf="issue.comments.length > 0">
            <div 
              *ngFor="let comment of issue.comments" 
              class="border border-base-300 rounded-xl p-6 bg-base-200">
              <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                    <div class="font-semibold text-base-content">{{ comment.author.fullName }}</div>
                    <div class="text-sm text-base-content/60">{{ comment.createdAt | date:'medium' }}</div>
                </div>
                <button 
                  class="btn btn-ghost btn-sm text-error hover:bg-error hover:text-error-content"
                  (click)="deleteComment(comment.id)"
                  *ngIf="comment.author.id === currentUser?.id">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
              <p class="text-base-content leading-relaxed whitespace-pre-wrap">{{ comment.content }}</p>
            </div>
          </div>

          <div *ngIf="issue.comments.length === 0" class="text-center py-12 text-base-content/60">
            <svg class="w-16 h-16 mx-auto mb-4 text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <p class="text-lg font-medium">No comments yet</p>
            <p class="text-sm">Be the first to comment!</p>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="isLoading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Edit Issue Modal -->
    <dialog id="edit_issue_modal" class="modal">
      <div class="modal-box w-11/12 max-w-2xl bg-base-100 border border-base-300">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="font-bold text-2xl mb-6 text-base-content">Edit Issue</h3>
        
        <form [formGroup]="editIssueForm" (ngSubmit)="onUpdateIssue()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="form-control w-full">
              <label class="label">
                <span class="label-text">Title</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter issue title" 
                class="input input-bordered w-full"
                formControlName="title">
            </div>

            <div class="form-control w-full">
              <label class="label">
                <span class="label-text">Type</span>
              </label>
              <select class="select select-bordered w-full" formControlName="type">
                <option [ngValue]="IssueType.Task">Task</option>
                <option [ngValue]="IssueType.Bug">Bug</option>
                <option [ngValue]="IssueType.Feature">Feature</option>
                <option [ngValue]="IssueType.Epic">Epic</option>
              </select>
            </div>
          </div>

          <div class="form-control w-full mb-4">
            <label class="label">
              <span class="label-text">Description</span>
            </label>
            <textarea 
              placeholder="Enter issue description" 
              class="textarea textarea-bordered w-full"
              formControlName="description"
              rows="4"></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="form-control w-full">
              <label class="label">
                <span class="label-text">Status</span>
              </label>
              <select class="select select-bordered w-full" formControlName="status">
                <option [ngValue]="IssueStatus.Todo">Todo</option>
                <option [ngValue]="IssueStatus.InProgress">In Progress</option>
                <option [ngValue]="IssueStatus.InReview">In Review</option>
                <option [ngValue]="IssueStatus.Done">Done</option>
              </select>
            </div>

            <div class="form-control w-full">
              <label class="label">
                <span class="label-text">Priority</span>
              </label>
              <select class="select select-bordered w-full" formControlName="priority">
                <option [ngValue]="IssuePriority.Low">Low</option>
                <option [ngValue]="IssuePriority.Medium">Medium</option>
                <option [ngValue]="IssuePriority.High">High</option>
                <option [ngValue]="IssuePriority.Critical">Critical</option>
              </select>
            </div>

            <div class="form-control w-full">
              <label class="label">
                <span class="label-text font-semibold">Assignees</span>
              </label>
              <div class="flex flex-wrap gap-3 p-4 border border-base-300 rounded-lg min-h-[3rem] bg-base-200">
                <div 
                  *ngFor="let member of projectMembers" 
                  class="flex items-center">
                  <label class="label cursor-pointer hover:bg-base-300 p-2 rounded-lg transition-colors">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-sm checkbox-primary"
                      [value]="member.user.id"
                      (change)="onEditAssigneeChange($event, member.user.id)">
                    <span class="label-text ml-3 text-base-content">{{ member.user.fullName }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-action gap-3">
            <button type="button" class="btn btn-outline" onclick="edit_issue_modal.close()">Cancel</button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="editIssueForm.invalid || isUpdatingIssue">
              <span *ngIf="!isUpdatingIssue">Update Issue</span>
              <span *ngIf="isUpdatingIssue" class="loading loading-spinner loading-sm"></span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  `,
  styles: []
})
export class IssueDetailComponent implements OnInit {
  issue: Issue | null = null;
  issueId!: number;
  isLoading = false;
  isAddingComment = false;
  isUpdatingIssue = false;
  projectMembers: ProjectMember[] = [];
  
  commentForm: FormGroup;
  editIssueForm: FormGroup;

  // Expose enums to template
  IssueType = IssueType;
  IssuePriority = IssuePriority;
  IssueStatus = IssueStatus;

  constructor(
    private route: ActivatedRoute,
    private issueService: IssueService,
    private projectService: ProjectService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(1000)]]
    });
    
    this.editIssueForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(2000)]],
      status: [IssueStatus.Todo],
      priority: [IssuePriority.Medium],
      type: [IssueType.Task],
      assigneeIds: [[]]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.issueId = +params['id'];
      this.loadIssue();
    });
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  loadIssue() {
    this.isLoading = true;
    this.issueService.getIssue(this.issueId).subscribe({
      next: (issue) => {
        this.issue = issue;
        this.loadProjectMembers();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading issue:', error);
        this.isLoading = false;
      }
    });
  }

  loadProjectMembers() {
    if (this.issue) {
      this.projectService.getProject(this.issue.projectId).subscribe({
        next: (project) => {
          this.projectMembers = project.members;
        },
        error: (error) => {
          console.error('Error loading project members:', error);
        }
      });
    }
  }

  openEditModal() {
    if (this.issue) {
      this.editIssueForm.patchValue({
        title: this.issue.title,
        description: this.issue.description,
        status: this.issue.status,
        priority: this.issue.priority,
        type: this.issue.type,
        assigneeIds: this.issue.assignees.map(a => a.id)
      });
      
      // Set checkbox states after a brief delay to ensure DOM is ready
      setTimeout(() => {
        const assigneeIds = this.issue!.assignees.map(a => a.id);
        this.projectMembers.forEach(member => {
          const checkbox = document.querySelector(`input[value="${member.user.id}"]`) as HTMLInputElement;
          if (checkbox) {
            checkbox.checked = assigneeIds.includes(member.user.id);
          }
        });
      }, 100);
      
      (document.getElementById('edit_issue_modal') as any)?.showModal();
    }
  }

  onUpdateIssue() {
    if (this.editIssueForm.valid && this.issue) {
      this.isUpdatingIssue = true;
      
      const formValue = this.editIssueForm.value;
      const request: UpdateIssueRequest = {
        ...formValue,
        assigneeIds: formValue.assigneeIds || []
      };
      
      this.issueService.updateIssue(this.issue.id, request).subscribe({
        next: (updatedIssue) => {
          this.issue = updatedIssue;
          this.isUpdatingIssue = false;
          (document.getElementById('edit_issue_modal') as any)?.close();
        },
        error: (error) => {
          console.error('Error updating issue:', error);
          this.isUpdatingIssue = false;
        }
      });
    }
  }

  onEditAssigneeChange(event: Event, assigneeId: number) {
    const checkbox = event.target as HTMLInputElement;
    const assigneeIds = this.editIssueForm.get('assigneeIds')?.value || [];

    if (checkbox.checked) {
      if (!assigneeIds.includes(assigneeId)) {
        this.editIssueForm.get('assigneeIds')?.setValue([...assigneeIds, assigneeId]);
      }
    } else {
      this.editIssueForm.get('assigneeIds')?.setValue(assigneeIds.filter((id: number) => id !== assigneeId));
    }
  }

  onAddComment() {
    if (this.commentForm.valid && this.issue) {
      this.isAddingComment = true;
      
      const request: CreateCommentRequest = this.commentForm.value;
      
      this.issueService.addComment(this.issue.id, request).subscribe({
        next: (comment) => {
          this.issue!.comments.push(comment);
          this.commentForm.reset();
          this.isAddingComment = false;
        },
        error: (error) => {
          console.error('Error adding comment:', error);
          this.isAddingComment = false;
        }
      });
    }
  }

  deleteComment(commentId: number) {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.issueService.deleteComment(commentId).subscribe({
        next: () => {
          if (this.issue) {
            this.issue.comments = this.issue.comments.filter(c => c.id !== commentId);
          }
        },
        error: (error) => {
          console.error('Error deleting comment:', error);
        }
      });
    }
  }

  getPriorityClass(priority: IssuePriority): string {
    switch (priority) {
      case IssuePriority.Low: return 'badge-success';
      case IssuePriority.Medium: return 'badge-warning';
      case IssuePriority.High: return 'badge-error';
      case IssuePriority.Critical: return 'badge-error';
      default: return 'badge-neutral';
    }
  }

  getPriorityText(priority: IssuePriority): string {
    switch (priority) {
      case IssuePriority.Low: return 'Low';
      case IssuePriority.Medium: return 'Medium';
      case IssuePriority.High: return 'High';
      case IssuePriority.Critical: return 'Critical';
      default: return 'Medium';
    }
  }

  getStatusClass(status: IssueStatus): string {
    switch (status) {
      case IssueStatus.Todo: return 'badge-neutral';
      case IssueStatus.InProgress: return 'badge-info';
      case IssueStatus.InReview: return 'badge-warning';
      case IssueStatus.Done: return 'badge-success';
      default: return 'badge-neutral';
    }
  }

  getStatusText(status: IssueStatus): string {
    switch (status) {
      case IssueStatus.Todo: return 'Todo';
      case IssueStatus.InProgress: return 'In Progress';
      case IssueStatus.InReview: return 'In Review';
      case IssueStatus.Done: return 'Done';
      default: return 'Todo';
    }
  }

  getTypeText(type: IssueType): string {
    switch (type) {
      case IssueType.Task: return 'Task';
      case IssueType.Bug: return 'Bug';
      case IssueType.Feature: return 'Feature';
      case IssueType.Epic: return 'Epic';
      default: return 'Task';
    }
  }
}
