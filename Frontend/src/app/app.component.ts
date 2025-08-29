import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { User } from './core/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-base-100" data-theme="dark-elegant">
      <!-- show after auth is resolved to avoid flicker -->
      <ng-container *ngIf="currentUser$ | async as user">
        <div class="navbar border-b border-base-300">

          <!-- LEFT: brand & mobile menu -->
          <div class="navbar-start">
            <div class="dropdown">
              <button tabindex="0" class="btn btn-ghost lg:hidden" aria-label="Open menu">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              <ul tabindex="0"
                  class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300">
                <li>
                  <a routerLink="/projects"
                     routerLinkActive="active"
                     [routerLinkActiveOptions]="{ exact: true }"
                     class="text-base-content hover:text-primary">
                    Projects
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <!-- CENTER: desktop nav -->
          <div class="navbar-center hidden lg:flex">
            <ul class="menu menu-horizontal px-1">
              <li>
                <a routerLink="/projects"
                   routerLinkActive="active"
                   [routerLinkActiveOptions]="{ exact: true }"
                   class="btn btn-ghost text-base-content hover:text-primary">
                  Projects
                </a>
              </li>
            </ul>
          </div>

          <!-- RIGHT: user menu -->
          <div class="navbar-end">
            <div class="dropdown dropdown-end">
              <button tabindex="0" class="btn btn-ghost">
                {{ user.fullName }}
                <svg class="ml-2 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                        clip-rule="evenodd"/>
                </svg>
              </button>
              <ul tabindex="0"
                  class="mt-3 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-300">
                <li><a routerLink="/projects" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
                       class="text-base-content hover:text-primary">Projects</a></li>
                <li><a (click)="logout()" class="text-base-content hover:text-error">Logout</a></li>
              </ul>
            </div>
          </div>

        </div>
      </ng-container>

      <main class="container mx-auto px-6 py-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent implements OnInit {
  currentUser$: Observable<User | null>;
  constructor(private authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.currentUser$;
  }
  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
    }
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}

