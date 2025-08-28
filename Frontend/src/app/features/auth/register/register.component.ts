import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-base-200">
      <div class="card w-96 bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title justify-center text-2xl mb-6">Create Account</h2>
          
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">First Name</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter your first name" 
                class="input input-bordered w-full"
                [class.input-error]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
                formControlName="firstName">
              <label class="label" *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched">
                <span class="label-text-alt text-error">First name is required</span>
              </label>
            </div>

            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">Last Name</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter your last name" 
                class="input input-bordered w-full"
                [class.input-error]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
                formControlName="lastName">
              <label class="label" *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched">
                <span class="label-text-alt text-error">Last name is required</span>
              </label>
            </div>

            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">Email</span>
              </label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                class="input input-bordered w-full"
                [class.input-error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                formControlName="email">
              <label class="label" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
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
                [class.input-error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                formControlName="password">
              <label class="label" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                <span class="label-text-alt text-error">Password must be at least 6 characters</span>
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
                [disabled]="registerForm.invalid || isLoading">
                <span *ngIf="!isLoading">Create Account</span>
                <span *ngIf="isLoading">Creating Account...</span>
              </button>
            </div>
          </form>

          <div class="divider">OR</div>
          
          <p class="text-center">
            Already have an account? 
            <a routerLink="/auth/login" class="link link-primary">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const registerRequest: RegisterRequest = this.registerForm.value;
      
      this.authService.register(registerRequest).subscribe({
        next: () => {
          this.router.navigate(['/projects']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }
}
