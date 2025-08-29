import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CdkDropList, CdkDropListGroup, CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { IssueService } from '../../../core/services/issue.service';
import { ProjectService } from '../../../core/services/project.service';
import { Issue, Project, CreateIssueRequest, UpdateIssueRequest, IssueStatus, IssuePriority, IssueType, ProjectMember } from '../../../core/models';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CdkDropListGroup, CdkDropList, CdkDrag],
  template: `
    <div *ngIf="project" class="max-w-7xl mx-auto space-y-8">
      <!-- Project Header -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div class="flex-1">
          <h1 class="text-4xl font-bold text-base-content mb-2">{{ project.name }}</h1>
          <p class="text-base-content/70 text-lg">{{ project.description }}</p>
        </div>
        <div class="flex-shrink-0">
          <button class="btn btn-outline btn-lg" (click)="openCreateModal()">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Create Issue
          </button>
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Todo Column -->
        <div class="bg-base-100 rounded-xl border border-base-300 p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-base-content">Todo</h3>
            <span class="badge badge-neutral badge-lg">{{ todoIssues.length }}</span>
          </div>
          <div 
            cdkDropList
            id="todo-list"
            [cdkDropListData]="todoIssues"
            [cdkDropListConnectedTo]="connectedLists"
            (cdkDropListDropped)="onDrop($event)"
            class="space-y-4 min-h-[400px]">
            <div 
              *ngFor="let issue of todoIssues" 
              cdkDrag
              class="card bg-base-100 shadow-lg border border-base-300 cursor-move hover:shadow-xl transition-all duration-200">
              <div class="card-body p-4">
                <div class="flex justify-between items-start mb-3">
                  <div class="flex items-center gap-2">
                    <div class="badge badge-outline badge-sm">{{ getTypeText(issue.type) }}</div>
                    <div class="badge badge-sm" [ngClass]="getPriorityClass(issue.priority)">
                      {{ getPriorityText(issue.priority) }}
                    </div>
                  </div>
                </div>
                <h4 class="font-semibold text-base-content text-sm line-clamp-2 mb-3 cursor-pointer hover:text-primary transition-colors" (click)="openIssueDetail(issue)">
                  {{ issue.title }}
                </h4>
                <div class="flex items-center justify-between">
                  <div class="flex -space-x-2" *ngIf="issue.assignees.length > 0">
                    <div 
                      *ngFor="let assignee of issue.assignees.slice(0, 3)"
                      class="avatar tooltip"
                      [attr.data-tip]="assignee.fullName">
                      <div class="w-7 h-7 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center font-semibold border-2 border-base-100">
                        {{ assignee.firstName.charAt(0) }}{{ assignee.lastName.charAt(0) }}
                      </div>
                    </div>
                    <div 
                      *ngIf="issue.assignees.length > 3"
                      class="w-7 h-7 rounded-full bg-base-300 text-base-content text-xs flex items-center justify-center font-semibold border-2 border-base-100">
                      +{{ issue.assignees.length - 3 }}
                    </div>
                  </div>
                  <div class="text-xs text-base-content/60">
                    {{ issue.createdAt | date:'MMM d' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- In Progress Column -->
        <div class="bg-base-100 rounded-xl border border-base-300 p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-base-content">In Progress</h3>
            <span class="badge badge-info badge-lg">{{ inProgressIssues.length }}</span>
          </div>
          <div 
            cdkDropList
            id="in-progress-list"
            [cdkDropListData]="inProgressIssues"
            [cdkDropListConnectedTo]="connectedLists"
            (cdkDropListDropped)="onDrop($event)"
            class="space-y-4 min-h-[400px]">
            <div 
              *ngFor="let issue of inProgressIssues" 
              cdkDrag
              class="card bg-base-100 shadow-lg border border-base-300 cursor-move hover:shadow-xl transition-all duration-200">
              <div class="card-body p-4">
                <div class="flex justify-between items-start mb-3">
                  <div class="flex items-center gap-2">
                    <div class="badge badge-outline badge-sm">{{ getTypeText(issue.type) }}</div>
                    <div class="badge badge-sm" [ngClass]="getPriorityClass(issue.priority)">
                      {{ getPriorityText(issue.priority) }}
                    </div>
                  </div>
                </div>
                <h4 class="font-semibold text-base-content text-sm line-clamp-2 mb-3 cursor-pointer hover:text-primary transition-colors" (click)="openIssueDetail(issue)">
                  {{ issue.title }}
                </h4>
                <div class="flex items-center justify-between">
                  <div class="flex -space-x-2" *ngIf="issue.assignees.length > 0">
                    <div 
                      *ngFor="let assignee of issue.assignees.slice(0, 3)"
                      class="avatar tooltip"
                      [attr.data-tip]="assignee.fullName">
                      <div class="w-7 h-7 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center font-semibold border-2 border-base-100">
                        {{ assignee.firstName.charAt(0) }}{{ assignee.lastName.charAt(0) }}
                      </div>
                    </div>
                    <div 
                      *ngIf="issue.assignees.length > 3"
                      class="w-7 h-7 rounded-full bg-base-300 text-base-content text-xs flex items-center justify-center font-semibold border-2 border-base-100">
                      +{{ issue.assignees.length - 3 }}
                    </div>
                  </div>
                  <div class="text-xs text-base-content/60">
                    {{ issue.createdAt | date:'MMM d' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- In Review Column -->
        <div class="bg-base-100 rounded-xl border border-base-300 p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-base-content">In Review</h3>
            <span class="badge badge-warning badge-lg">{{ inReviewIssues.length }}</span>
          </div>
          <div 
            cdkDropList
            id="in-review-list"
            [cdkDropListData]="inReviewIssues"
            [cdkDropListConnectedTo]="connectedLists"
            (cdkDropListDropped)="onDrop($event)"
            class="space-y-4 min-h-[400px]">
            <div 
              *ngFor="let issue of inReviewIssues" 
              cdkDrag
              class="card bg-base-100 shadow-lg border border-base-300 cursor-move hover:shadow-xl transition-all duration-200">
              <div class="card-body p-4">
                <div class="flex justify-between items-start mb-3">
                  <div class="flex items-center gap-2">
                    <div class="badge badge-outline badge-sm">{{ getTypeText(issue.type) }}</div>
                    <div class="badge badge-sm" [ngClass]="getPriorityClass(issue.priority)">
                      {{ getPriorityText(issue.priority) }}
                    </div>
                  </div>
                </div>
                <h4 class="font-semibold text-base-content text-sm line-clamp-2 mb-3 cursor-pointer hover:text-primary transition-colors" (click)="openIssueDetail(issue)">
                  {{ issue.title }}
                </h4>
                <div class="flex items-center justify-between">
                  <div class="flex -space-x-2" *ngIf="issue.assignees.length > 0">
                    <div 
                      *ngFor="let assignee of issue.assignees.slice(0, 3)"
                      class="avatar tooltip"
                      [attr.data-tip]="assignee.fullName">
                      <div class="w-7 h-7 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center font-semibold border-2 border-base-100">
                        {{ assignee.firstName.charAt(0) }}{{ assignee.lastName.charAt(0) }}
                      </div>
                    </div>
                    <div 
                      *ngIf="issue.assignees.length > 3"
                      class="w-7 h-7 rounded-full bg-base-300 text-base-content text-xs flex items-center justify-center font-semibold border-2 border-base-100">
                      +{{ issue.assignees.length - 3 }}
                    </div>
                  </div>
                  <div class="text-xs text-base-content/60">
                    {{ issue.createdAt | date:'MMM d' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Done Column -->
        <div class="bg-base-100 rounded-xl border border-base-300 p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-base-content">Done</h3>
            <span class="badge badge-success badge-lg">{{ doneIssues.length }}</span>
          </div>
          <div 
            cdkDropList
            id="done-list"
            [cdkDropListData]="doneIssues"
            [cdkDropListConnectedTo]="connectedLists"
            (cdkDropListDropped)="onDrop($event)"
            class="space-y-4 min-h-[400px]">
            <div 
              *ngFor="let issue of doneIssues" 
              cdkDrag
              class="card bg-base-100 shadow-lg border border-base-300 cursor-move hover:shadow-xl transition-all duration-200">
              <div class="card-body p-4">
                <div class="flex justify-between items-start mb-3">
                  <div class="flex items-center gap-2">
                    <div class="badge badge-outline badge-sm">{{ getTypeText(issue.type) }}</div>
                    <div class="badge badge-sm" [ngClass]="getPriorityClass(issue.priority)">
                      {{ getPriorityText(issue.priority) }}
                    </div>
                  </div>
                </div>
                <h4 class="font-semibold text-base-content text-sm line-clamp-2 mb-3 cursor-pointer hover:text-primary transition-colors" (click)="openIssueDetail(issue)">
                  {{ issue.title }}
                </h4>
                <div class="flex items-center justify-between">
                  <div class="flex -space-x-2" *ngIf="issue.assignees.length > 0">
                    <div 
                      *ngFor="let assignee of issue.assignees.slice(0, 3)"
                      class="avatar tooltip"
                      [attr.data-tip]="assignee.fullName">
                      <div class="w-7 h-7 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center font-semibold border-2 border-base-100">
                        {{ assignee.firstName.charAt(0) }}{{ assignee.lastName.charAt(0) }}
                      </div>
                    </div>
                    <div 
                      *ngIf="issue.assignees.length > 3"
                      class="w-7 h-7 rounded-full bg-base-300 text-base-content text-xs flex items-center justify-center font-semibold border-2 border-base-100">
                      +{{ issue.assignees.length - 3 }}
                    </div>
                  </div>
                  <div class="text-xs text-base-content/60">
                    {{ issue.createdAt | date:'MMM d' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Issue Modal -->
    <dialog id="create_issue_modal" class="modal">
      <div class="modal-box w-11/12 max-w-2xl bg-base-100 border border-base-300">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="font-bold text-2xl mb-6 text-base-content">Create New Issue</h3>
        
        <form [formGroup]="createIssueForm" (ngSubmit)="onCreateIssue()">
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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  *ngFor="let member of project?.members" 
                  class="flex items-center">
                  <label class="label cursor-pointer hover:bg-base-300 p-2 rounded-lg transition-colors">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-sm checkbox-primary"
                      [value]="member.user.id"
                      (change)="onAssigneeChange($event, member.user.id)">
                    <span class="label-text ml-3 text-base-content">{{ member.user.fullName }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-action gap-3">
            <button type="button" class="btn btn-outline" onclick="create_issue_modal.close()">Cancel</button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="createIssueForm.invalid || isCreatingIssue">
              <span *ngIf="!isCreatingIssue">Create Issue</span>
              <span *ngIf="isCreatingIssue" class="loading loading-spinner loading-sm"></span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class KanbanBoardComponent implements OnInit {
  project: Project | null = null;
  projectId!: number;
  isLoading = false;
  isCreatingIssue = false;

  // Issue arrays for each column
  todoIssues: Issue[] = [];
  inProgressIssues: Issue[] = [];
  inReviewIssues: Issue[] = [];
  doneIssues: Issue[] = [];

  // Drag-drop connected lists (must match the template cdkDropList IDs)
  connectedLists: string[] = ['todo-list', 'in-progress-list', 'in-review-list', 'done-list'];

  createIssueForm: FormGroup;

  // Expose enums to template
  IssueType = IssueType;
  IssuePriority = IssuePriority;
  IssueStatus = IssueStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private issueService: IssueService,
    private projectService: ProjectService,
    private fb: FormBuilder
  ) {
    this.createIssueForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(2000)]],
      type: [IssueType.Task],
      priority: [IssuePriority.Medium],
      assigneeIds: [[]]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.projectId = +params['id'];
      this.loadProject();
      this.loadIssues();
    });
  }

  loadProject() {
    this.projectService.getProject(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
      },
      error: (error) => {
        console.error('Error loading project:', error);
      }
    });
  }

  loadIssues() {
    this.isLoading = true;
    this.issueService.getProjectIssues(this.projectId).subscribe({
      next: (issues) => {
        this.todoIssues = issues.filter(i => i.status === IssueStatus.Todo);
        this.inProgressIssues = issues.filter(i => i.status === IssueStatus.InProgress);
        this.inReviewIssues = issues.filter(i => i.status === IssueStatus.InReview);
        this.doneIssues = issues.filter(i => i.status === IssueStatus.Done);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading issues:', error);
        this.isLoading = false;
      }
    });
  }

  onDrop(event: CdkDragDrop<Issue[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update issue status
      this.updateIssueStatus(event.container.data[event.currentIndex], this.getStatusFromContainer(event.container.id));
    }
  }

  getStatusFromContainer(containerId: string): IssueStatus {
    if (containerId.includes('todo')) return IssueStatus.Todo;
    if (containerId.includes('progress')) return IssueStatus.InProgress;
    if (containerId.includes('review')) return IssueStatus.InReview;
    return IssueStatus.Done;
  }

  updateIssueStatus(issue: Issue, newStatus: IssueStatus) {
    const updateRequest: UpdateIssueRequest = {
      title: issue.title,
      description: issue.description,
      status: newStatus,
      priority: issue.priority,
      type: issue.type,
      assigneeIds: issue.assignees.map(a => a.id)
    };

    this.issueService.updateIssue(issue.id, updateRequest).subscribe({
      next: (updatedIssue) => {
        issue.status = updatedIssue.status;
      },
      error: (error) => {
        console.error('Error updating issue status:', error);
        // Revert the move
        this.loadIssues();
      }
    });
  }

  onCreateIssue() {
    if (this.createIssueForm.valid) {
      this.isCreatingIssue = true;
      
      const formValue = this.createIssueForm.value;
      const request: CreateIssueRequest = {
        ...formValue,
        projectId: this.projectId,
        assigneeIds: formValue.assigneeIds || []
      };
      
      this.issueService.createIssue(request).subscribe({
        next: (issue) => {
          this.todoIssues.unshift(issue);
          this.createIssueForm.reset({
            type: IssueType.Task,
            priority: IssuePriority.Medium,
            assigneeIds: []
          });
          this.isCreatingIssue = false;
          (document.getElementById('create_issue_modal') as any)?.close();
        },
        error: (error) => {
          console.error('Error creating issue:', error);
          this.isCreatingIssue = false;
        }
      });
    }
  }

  openIssueDetail(issue: Issue) {
    // Navigate to issue detail page
    this.router.navigate(['/issues', issue.id]);
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

  getTypeText(type: IssueType): string {
    switch (type) {
      case IssueType.Task: return 'Task';
      case IssueType.Bug: return 'Bug';
      case IssueType.Feature: return 'Feature';
      case IssueType.Epic: return 'Epic';
      default: return 'Task';
    }
  }

  openCreateModal() {
    this.createIssueForm.reset({
      type: IssueType.Task,
      priority: IssuePriority.Medium,
      assigneeIds: []
    });
    
    // Reset checkboxes
    setTimeout(() => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
    }, 100);
    
    (document.getElementById('create_issue_modal') as any)?.showModal();
  }

  onAssigneeChange(event: Event, assigneeId: number) {
    const checkbox = event.target as HTMLInputElement;
    const assigneeIds = this.createIssueForm.get('assigneeIds')?.value || [];

    if (checkbox.checked) {
      if (!assigneeIds.includes(assigneeId)) {
        this.createIssueForm.get('assigneeIds')?.setValue([...assigneeIds, assigneeId]);
      }
    } else {
      this.createIssueForm.get('assigneeIds')?.setValue(assigneeIds.filter((id: number) => id !== assigneeId));
    }
  }
}
