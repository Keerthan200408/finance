import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, RegisterRequest } from '../../services/auth.service';

// Custom validator for password confirmation
function passwordMatchValidator(control: AbstractControl) {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
  } else if (confirmPassword?.hasError('passwordMismatch')) {
    confirmPassword.setErrors(null);
  }
  
  return null;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  returnUrl = '/dashboard';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { confirmPassword, ...registerData } = this.registerForm.value;
      const registrationData: RegisterRequest = registerData;

      this.authService.register(registrationData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.snackBar.open('Registration successful! Welcome to Finance Manager!', 'Close', {
              duration: 5000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate([this.returnUrl]);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(error.message || 'Registration failed', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(field)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength']?.requiredLength;
      return `${this.getFieldDisplayName(field)} must be at least ${minLength} characters`;
    }
    if (control?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  private getFieldDisplayName(field: string): string {
    const fieldNames: { [key: string]: string } = {
      'firstName': 'First name',
      'lastName': 'Last name',
      'email': 'Email',
      'password': 'Password',
      'confirmPassword': 'Confirm password'
    };
    return fieldNames[field] || field;
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: this.returnUrl } 
    });
  }
}