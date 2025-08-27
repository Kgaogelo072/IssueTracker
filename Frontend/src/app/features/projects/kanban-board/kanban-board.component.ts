import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ProjectService } from '../../../core/services/project.service';
import { IssueService } from '../../../core/services/issue.service';
import { Project, Issue, IssueStatus, IssuePriority, IssueType, CreateIssueRequest, UpdateIssueRequest } from '../../../core/models';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, DragDropModule],
  template: `
    <div class="mb-6" *ngIf="project">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold">{{ project.name }}</h1>
          <p class="text-base-content/70">{{ project.description }}</p>
        </div>
        <button class="btn btn-primary" onclick="create_issue_modal.showModal()">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          New Issue
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6" *ngIf="!isLoading">
      <!-- Todo Column -->
      <div class="kanban-column">
        <div class="bg-base-200 p-4 rounded-lg">
          <h3 class="font-semibold mb-4 flex items-center">
            <div class="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            Todo ({{ todoIssues.length }})
          </h3>
          <div 
            cdkDropList 
            id="todo-list"
            [cdkDropListConnectedTo]="connectedLists"
            [cdkDropListData]="todoIssues"
            (cdkDropListDropped)="drop($event)"
            class="min-h-[400px] space-y-3">
            <div 
              *ngFor="let issue of todoIssues" 
              cdkDrag
              class="issue-card bg-base-100 p-4 rounded-lg shadow cursor-pointer"
              (click)="openIssueDetail(issue)">
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-medium text-sm">{{ issue.title }}</h4>
                <div class="badge badge-sm" [ngClass]="getPriorityClass(issue.priority)">
                  {{ getPriorityText(issue.priority) }}
                </div>
              </div>
              <p class="text-xs text-base-content/70 mb-3 line-clamp-2">{{ issue.description }}</p>
              <div class="flex justify-between items-center">
                <div class="badge badge-outline badge-xs">{{ getTypeText(issue.type) }}</div>
                <div class="flex -space-x-1" *ngIf="issue.assignees.length > 0">
                  <div 
                    *ngFor="let assignee of issue.assignees.slice(0, 3)" 
                    class="avatar">
                    <div class="w-6 h-6 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center">
                      {{ assignee.firstName.charAt(0) }}{{ assignee.lastName.charAt(0) }}
                    </div>
                  </div>
                  <div 
                    *ngIf="issue.assignees.length > 3"
                    class="avatar">
                    <div class="w-6 h-6 rounded-full bg-base-300 text-base-content text-xs flex items-center justify-center">
                      +{{ issue.assignees.length - 3 }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- In Progress Column -->
      <div class="kanban-column">
        <div class="bg-base-200 p-4 rounded-lg">
          <h3 class="font-semibold mb-4 flex items-center">
            <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            In Progress ({{ inProgressIssues.length }})
          </h3>
          <div 
            cdkDropList 
            id="in-progress-list"
            [cdkDropListConnectedTo]="connectedLists"
            [cdkDropListData]="inProgressIssues"
            (cdkDropListDropped)="drop($event)"
            class="min-h-[400px] space-y-3">
            <div 
              *ngFor="let issue of inProgressIssues" 
              cdkDrag
              class="issue-card bg-base-100 p-4 rounded-lg shadow cursor-pointer"
              (click)="openIssueDetail(issue)">
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-medium text-sm">{{ issue.title }}</h4>
                <div class="badge badge-sm" [ngClass]="getPriorityClass(issue.priority)">
                  {{ getPriorityText(issue.priority) }}
                </div>
              </div>
              <p class="text-xs text-base-content/70 mb-3 line-clamp-2">{{ issue.description }}</p>
              <div class="flex justify-between items-center">
                <div class="badge badge-outline badge-xs">{{ getTypeText(issue.type) }}</div>
                <div class="flex -space-x-1" *ngIf="issue.assignees.length > 0">
                  <div 
                    *ngFor="let assignee of issue.assignees.slice(0, 3)" 
                    class="avatar">
                    <div class="w-6 h-6 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center">
                      {{ assignee.firstName.charAt(0) }}{{ assignee.lastName.charAt(0) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- In Review Column -->
      <div class="kanban-column">
        <div class="bg-base-200 p-4 rounded-lg">
          <h3 class="font-semibold mb-4 flex items-center">
            <div class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            In Review ({{ inReviewIssues.length }})
          </h3>
          <div 
            cdkDropList 
            id="in-review-list"
            [cdkDropListConnectedTo]="connectedLists"
            [cdkDropListData]="inReviewIssues"
            (cdkDropListDropped)="drop($event)"
            class="min-h-[400px] space-y-3">
            <div 
              *ngFor="let issue of inReviewIssues" 
              cdkDrag
              class="issue-card bg-base-100 p-4 rounded-lg shadow cursor-pointer"
              (click)="openIssueDetail(issue)">
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-medium text-sm">{{ issue.title }}</h4>
                <div class="badge badge-sm" [ngClass]="getPriorityClass(issue.priority)">
                  {{ getPriorityText(issue.priority) }}
                </div>
              </div>
              <p class="text-xs text-base-content/70 mb-3 line-clamp-2">{{ issue.description }}</p>
              <div class="flex justify-between items-center">
                <div class="badge badge-outline badge-xs">{{ getTypeText(issue.type) }}</div>
                <div class="flex -space-x-1" *ngIf="issue.assignees.length > 0">
                  <div 
                    *ngFor="let assignee of issue.assignees.slice(0, 3)" 
                    class="avatar">
                    <div class="w-6 h-6 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center">
                      {{ assignee.firstName.charAt(0) }}{{ assignee.lastName.charAt(0) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Done Column -->
      <div class="kanban-column">
        <div class="bg-base-200 p-4 rounded-lg">
          <h3 class="font-semibold mb-4 flex items-center">
            <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Done ({{ doneIssues.length }})
          </h3>
          <div 
            cdkDropList 
            id="done-list"
            [cdkDropListConnectedTo]="connectedLists"
            [cdkDropListData]="doneIssues"
            (cdkDropListDropped)="drop($event)"
            class="min-h-[400px] space-y-3">
            <div 
              *ngFor="let issue of doneIssues" 
              cdkDrag
              class="issue-card bg-base-100 p-4 rounded-lg shadow cursor-pointer opacity-75"
              (click)="openIssueDetail(issue)">
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-medium text-sm">{{ issue.title }}</h4>
                <div class="badge badge-sm" [ngClass]="getPriorityClass(issue.priority)">
                  {{ getPriorityText(issue.priority) }}
                </div>
              </div>
              <p class="text-xs text-base-content/70 mb-3 line-clamp-2">{{ issue.description }}</p>
              <div class="flex justify-between items-center">
                <div class="badge badge-outline badge-xs">{{ getTypeText(issue.type) }}</div>
                <div class="flex -space-x-1" *ngIf="issue.assignees.length > 0">
                  <div 
                    *ngFor="let assignee of issue.assignees.slice(0, 3)" 
                    class="avatar">
                    <div class="w-6 h-6 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center">
                      {{ assignee.firstName.charAt(0) }}{{ assignee.lastName.charAt(0) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="isLoading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Create Issue Modal -->
    <dialog id="create_issue_modal" class="modal">
      <div class="modal-box w-11/12 max-w-2xl">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="font-bold text-lg mb-4">Create New Issue</h3>
        
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
                <option [value]="IssueType.Task">Task</option>
                <option [value]="IssueType.Bug">Bug</option>
                <option [value]="IssueType.Feature">Feature</option>
                <option [value]="IssueType.Epic">Epic</option>
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

          <div class="form-control w-full mb-6">
            <label class="label">
              <span class="label-text">Priority</span>
            </label>
            <select class="select select-bordered w-full" formControlName="priority">
              <option [value]="IssuePriority.Low">Low</option>
              <option [value]="IssuePriority.Medium">Medium</option>
              <option [value]="IssuePriority.High">High</option>
              <option [value]="IssuePriority.Critical">Critical</option>
            </select>
          </div>

          <div class="modal-action">
            <button type="button" class="btn" onclick="create_issue_modal.close()">Cancel</button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="createIssueForm.invalid || isCreatingIssue">
              Create Issue
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
    private projectService: ProjectService,
    private issueService: IssueService,
    private fb: FormBuilder
  ) {
    this.createIssueForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(2000)]],
      type: [IssueType.Task],
      priority: [IssuePriority.Medium]
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
        this.organizeIssues(issues);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading issues:', error);
        this.isLoading = false;
      }
    });
  }

  organizeIssues(issues: Issue[]) {
    this.todoIssues = issues.filter(issue => issue.status === IssueStatus.Todo);
    this.inProgressIssues = issues.filter(issue => issue.status === IssueStatus.InProgress);
    this.inReviewIssues = issues.filter(issue => issue.status === IssueStatus.InReview);
    this.doneIssues = issues.filter(issue => issue.status === IssueStatus.Done);
  }

  drop(event: CdkDragDrop<Issue[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const issue = event.previousContainer.data[event.previousIndex];
      const newStatus = this.getStatusFromContainer(event.container.id);
      
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update issue status
      this.updateIssueStatus(issue, newStatus);
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
      
      const request: CreateIssueRequest = {
        ...this.createIssueForm.value,
        projectId: this.projectId,
        assigneeIds: []
      };
      
      this.issueService.createIssue(request).subscribe({
        next: (issue) => {
          this.todoIssues.unshift(issue);
          this.createIssueForm.reset({
            type: IssueType.Task,
            priority: IssuePriority.Medium
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
    // TODO: Implement issue detail modal or navigation
    console.log('Open issue detail:', issue);
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
}
