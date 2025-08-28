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
    <div *ngIf="project" class="max-w-7xl mx-auto space-y-6">
      <!-- Project Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold">{{ project.name }}</h1>
          <p class="text-base-content/70 mt-1">{{ project.description }}</p>
        </div>
        <button class="btn btn-outline btn-sm" (click)="openCreateModal()">
          Create Issue
        </button>
      </div>

      <!-- Kanban Board -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Todo Column -->
        <div class="bg-base-200 rounded-lg p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold">Todo ({{ todoIssues.length }})</h3>
          </div>
          <div 
            cdkDropList
            id="todo-list"
            [cdkDropListData]="todoIssues"
            [cdkDropListConnectedTo]="connectedLists"
            (cdkDropListDropped)="onDrop($event)"
            class="space-y-3 min-h-[200px]">
            <div 
              *ngFor="let issue of todoIssues" 
              cdkDrag
              class="card bg-base-100 shadow-sm cursor-move">
              <div class="card-body p-4">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center gap-2">
                    <div class="badge badge-outline badge-xs">{{ getTypeText(issue.type) }}</div>
                    <div class="badge badge-xs" [ngClass]="getPriorityClass(issue.priority)">
                      {{ getPriorityText(issue.priority) }}
                    </div>
                  </div>
                </div>
                <h4 class="font-medium text-sm line-clamp-2 mb-2" (click)="openIssueDetail(issue)">
                  {{ issue.title }}
                </h4>
                <div class="flex items-center justify-between">
                  <div class="flex -space-x-1" *ngIf="issue.assignees.length > 0">
                    <div 
                      *ngFor="let assignee of issue.assignees.slice(0, 3)"
                      class="avatar tooltip"
                      [attr.data-tip]="assignee.fullName">
                      <div class="w-6 h-6 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center">
                        {{ assignee.firstName.charAt(0) }}{{ assignee.lastName.charAt(0) }}
                      </div>
                    </div>
                    <div 
                      *ngIf="issue.assignees.length > 3"
                      class="w-6 h-6 rounded-full bg-base-300 text-base-content text-xs flex items-center justify-center">
                      +{{ issue.assignees.length - 3 }}
                    </div>
                  </div>
                  <div class="text-xs text-base-content/70">
                    {{ issue.createdAt | date:'shortDate' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- In Progress Column -->
        <div class="bg-base-200 rounded-lg p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold">In Progress ({{ inProgressIssues.length }})</h3>
          </div>
          <div 
            cdkDropList
            id="in-progress-list"
            [cdkDropListData]="inProgressIssues"
            [cdkDropListConnectedTo]="connectedLists"
            (cdkDropListDropped)="onDrop($event)"
            class="space-y-3 min-h-[200px]">
            <div 
              *ngFor="let issue of inProgressIssues" 
              cdkDrag
              class="card bg-base-100 shadow-sm cursor-move">
              <div class="card-body p-4">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center gap-2">
                    <div class="badge badge-outline badge-xs">{{ getTypeText(issue.type) }}</div>
                    <div class="badge badge-xs" [ngClass]="getPriorityClass(issue.priority)">
                      {{ getPriorityText(issue.priority) }}
                    </div>
                  </div>
                </div>
                <h4 class="font-medium text-sm line-clamp-2 mb-2" (click)="openIssueDetail(issue)">
                  {{ issue.title }}
                </h4>
                <div class="flex items-center justify-between">
                  <div class="flex -space-x-1" *ngIf="issue.assignees.length > 0">
                    <div 
                      *ngFor="let assignee of issue.assignees.slice(0, 3)"
                      class="avatar tooltip"
                      [attr.data-tip]="assignee.fullName">
                      <div class="w-6 h-6 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center">
                        {{ assignee.firstName.charAt(0) }}{{ assignee.lastName.charAt(0) }}
                      </div>
                    </div>
                    <div 
                      *ngIf="issue.assignees.length > 3"
                      class="w-6 h-6 rounded-full bg-base-300 text-base-content text-xs flex items-center justify-center">
                      +{{ issue.assignees.length - 3 }}
                    </div>
                  </div>
                  <div class="text-xs text-base-content/70">
                    {{ issue.createdAt | date:'shortDate' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- In Review Column -->
        <div class="bg-base-200 rounded-lg p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold">In Review ({{ inReviewIssues.length }})</h3>
          </div>
          <div 
            cdkDropList
            id="in-review-list"
            [cdkDropListData]="inReviewIssues"
            [cdkDropListConnectedTo]="connectedLists"
            (cdkDropListDropped)="onDrop($event)"
            class="space-y-3 min-h-[200px]">
            <div 
              *ngFor="let issue of inReviewIssues" 
              cdkDrag
              class="card bg-base-100 shadow-sm cursor-move">
              <div class="card-body p-4">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center gap-2">
                    <div class="badge badge-outline badge-xs">{{ getTypeText(issue.type) }}</div>
                    <div class="badge badge-xs" [ngClass]="getPriorityClass(issue.priority)">
                      {{ getPriorityText(issue.priority) }}
                    </div>
                  </div>
                </div>
                <h4 class="font-medium text-sm line-clamp-2 mb-2" (click)="openIssueDetail(issue)">
                  {{ issue.title }}
                </h4>
                <div class="flex items-center justify-between">
                  <div class="flex -space-x-1" *ngIf="issue.assignees.length > 0">
                    <div 
                      *ngFor="let assignee of issue.assignees.slice(0, 3)"
                      class="avatar tooltip"
                      [attr.data-tip]="assignee.fullName">
                      <div class="w-6 h-6 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center">
                        {{ assignee.firstName.charAt(0) }}{{ assignee.lastName.charAt(0) }}
                      </div>
                    </div>
                    <div 
                      *ngIf="issue.assignees.length > 3"
                      class="w-6 h-6 rounded-full bg-base-300 text-base-content text-xs flex items-center justify-center">
                      +{{ issue.assignees.length - 3 }}
                    </div>
                  </div>
                  <div class="text-xs text-base-content/70">
                    {{ issue.createdAt | date:'shortDate' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Done Column -->
        <div class="bg-base-200 rounded-lg p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold">Done ({{ doneIssues.length }})</h3>
          </div>
          <div 
            cdkDropList
            id="done-list"
            [cdkDropListData]="doneIssues"
            [cdkDropListConnectedTo]="connectedLists"
            (cdkDropListDropped)="onDrop($event)"
            class="space-y-3 min-h-[200px]">
            <div 
              *ngFor="let issue of doneIssues" 
              cdkDrag
              class="card bg-base-100 shadow-sm cursor-move">
              <div class="card-body p-4">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center gap-2">
                    <div class="badge badge-outline badge-xs">{{ getTypeText(issue.type) }}</div>
                    <div class="badge badge-xs" [ngClass]="getPriorityClass(issue.priority)">
                      {{ getPriorityText(issue.priority) }}
                    </div>
                  </div>
                </div>
                <h4 class="font-medium text-sm line-clamp-2 mb-2" (click)="openIssueDetail(issue)">
                  {{ issue.title }}
                </h4>
                <div class="flex items-center justify-between">
                  <div class="flex -space-x-1" *ngIf="issue.assignees.length > 0">
                    <div 
                      *ngFor="let assignee of issue.assignees.slice(0, 3)"
                      class="avatar tooltip"
                      [attr.data-tip]="assignee.fullName">
                      <div class="w-6 h-6 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center">
                        {{ assignee.firstName.charAt(0) }}{{ assignee.lastName.charAt(0) }}
                      </div>
                    </div>
                    <div 
                      *ngIf="issue.assignees.length > 3"
                      class="w-6 h-6 rounded-full bg-base-300 text-base-content text-xs flex items-center justify-center">
                      +{{ issue.assignees.length - 3 }}
                    </div>
                  </div>
                  <div class="text-xs text-base-content/70">
                    {{ issue.createdAt | date:'shortDate' }}
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
                <span class="label-text">Assignees</span>
              </label>
              <div class="flex flex-wrap gap-2 p-2 border border-base-300 rounded-lg min-h-[2.5rem]">
                <div 
                  *ngFor="let member of project?.members" 
                  class="flex items-center gap-2">
                  <label class="label cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-sm"
                      [value]="member.user.id"
                      (change)="onAssigneeChange($event, member.user.id)">
                    <span class="label-text ml-2">{{ member.user.fullName }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-action">
            <button type="button" class="btn btn-outline btn-sm" onclick="create_issue_modal.close()">Cancel</button>
            <button 
              type="submit" 
              class="btn btn-outline btn-sm"
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
