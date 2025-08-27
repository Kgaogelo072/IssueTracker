export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  owner: User;
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
  issueCount: number;
}

export interface ProjectMember {
  id: number;
  user: User;
  role: ProjectRole;
  joinedAt: string;
}

export enum ProjectRole {
  Member = 0,
  Admin = 1
}

export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface UpdateProjectRequest {
  name: string;
  description: string;
}

export interface AddMemberRequest {
  email: string;
  role: ProjectRole;
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  projectId: number;
  projectName: string;
  creator: User;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  createdAt: string;
  updatedAt: string;
  assignees: User[];
  comments: Comment[];
}

export enum IssueStatus {
  Todo = 0,
  InProgress = 1,
  InReview = 2,
  Done = 3
}

export enum IssuePriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

export enum IssueType {
  Task = 0,
  Bug = 1,
  Feature = 2,
  Epic = 3
}

export interface CreateIssueRequest {
  title: string;
  description: string;
  projectId: number;
  priority: IssuePriority;
  type: IssueType;
  assigneeIds: number[];
}

export interface UpdateIssueRequest {
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  assigneeIds: number[];
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
}
