import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Issue, CreateIssueRequest, UpdateIssueRequest, Comment, CreateCommentRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProjectIssues(projectId: number): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${this.API_URL}/issues/project/${projectId}`);
  }

  getIssue(id: number): Observable<Issue> {
    return this.http.get<Issue>(`${this.API_URL}/issues/${id}`);
  }

  createIssue(request: CreateIssueRequest): Observable<Issue> {
    return this.http.post<Issue>(`${this.API_URL}/issues`, request);
  }

  updateIssue(id: number, request: UpdateIssueRequest): Observable<Issue> {
    return this.http.put<Issue>(`${this.API_URL}/issues/${id}`, request);
  }

  deleteIssue(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/issues/${id}`);
  }

  addComment(issueId: number, request: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.API_URL}/issues/${issueId}/comments`, request);
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/issues/comments/${commentId}`);
  }
}
