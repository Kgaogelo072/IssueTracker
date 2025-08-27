import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, CreateProjectRequest, UpdateProjectRequest, AddMemberRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.API_URL}/projects`);
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.API_URL}/projects/${id}`);
  }

  createProject(request: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(`${this.API_URL}/projects`, request);
  }

  updateProject(id: number, request: UpdateProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${this.API_URL}/projects/${id}`, request);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/projects/${id}`);
  }

  addMember(projectId: number, request: AddMemberRequest): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/projects/${projectId}/members`, request);
  }

  removeMember(projectId: number, memberId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/projects/${projectId}/members/${memberId}`);
  }
}
