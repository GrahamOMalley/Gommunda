import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Adjust the path as needed
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: string = ''; // Bind to email input
  password: string = ''; // Bind to password input
  errorMessage: string = ''; // Display error messages

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.router.navigate(['/dashboard']); // Redirect to dashboard if logged in
      }
    });
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle().catch((error) => {
      console.error('Google login failed:', error);
      this.errorMessage = 'Google login failed. Please try again.';
    });
  }

  loginWithEmail(): void {
    this.authService.loginWithEmailAndPassword(this.email, this.password).then(() => {
      console.log('Logged in with email and password');
    }).catch((error) => {
      console.error('Email login failed:', error);
      this.errorMessage = 'Email login failed. Please check your credentials and try again.';
    });
  }
}
