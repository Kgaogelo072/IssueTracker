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
      <div class="navbar bg-base-200 border-b border-base-300" *ngIf="currentUser$ | async as user">
        <div class="navbar-start">
          <div class="dropdown">
            <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16"></path>
              </svg>
            </div>
            <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300">
              <li><a routerLink="/projects" routerLinkActive="active" class="text-base-content hover:text-primary">Projects</a></li>
            </ul>
          </div>
        </div>

        <div class="navbar-center hidden lg:flex">
          <ul class="menu menu-horizontal px-1">
            <li><a routerLink="/projects" routerLinkActive="active" class="btn btn-ghost text-base-content hover:text-primary">Projects</a></li>
          </ul>
        </div>

        <div class="navbar-end">
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
              <div class="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-semibold">
                {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
              </div>
            </div>
            <ul tabindex="0" class="mt-3 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-300">
              <li class="menu-title text-base-content">{{ user.fullName }}</li>
              <li><a class="text-base-content hover:text-primary">Profile</a></li>
              <li><a class="text-base-content hover:text-primary">Settings</a></li>
              <li><a (click)="logout()" class="text-base-content hover:text-error">Logout</a></li>
            </ul>
          </div>
        </div>
      </div>

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
