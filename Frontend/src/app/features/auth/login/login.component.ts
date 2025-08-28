import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-base-200">
      <div class="card w-96 bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title justify-center text-2xl mb-6">Login to Issue Tracker</h2>
          
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">Email</span>
              </label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                class="input input-bordered w-full"
                [class.input-error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                formControlName="email">
              <label class="label" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                <span class="label-text-alt text-error">Please enter a valid email</span>
              </label>
            </div>

            <div class="form-control w-full mb-6">
              <label class="label">
                <span class="label-text">Password</span>
              </label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                class="input input-bordered w-full"
                [class.input-error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                formControlName="password">
              <label class="label" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                <span class="label-text-alt text-error">Password is required</span>
              </label>
            </div>

            <div class="alert alert-error mb-4" *ngIf="errorMessage">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ errorMessage }}</span>
            </div>

            <div class="card-actions justify-end">
              <button 
                type="submit" 
                class="btn btn-outline btn-sm w-full"
                [class.loading]="isLoading"
                [disabled]="loginForm.invalid || isLoading">
                <span *ngIf="!isLoading">Login</span>
                <span *ngIf="isLoading">Logging in...</span>
              </button>
            </div>
          </form>

          <div class="divider">OR</div>
          
          <p class="text-center">
            Don't have an account? 
            <a routerLink="/auth/register" class="link link-primary">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const loginRequest: LoginRequest = this.loginForm.value;
      
      this.authService.login(loginRequest).subscribe({
        next: () => {
          this.router.navigate(['/projects']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        }
      });
    }
  }
}
