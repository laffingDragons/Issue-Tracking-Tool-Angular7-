import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule, MatCheckboxModule, MatSelectModule, MatInputModule, MatButtonModule, MatFormFieldModule, MatSnackBarModule, MatProgressBarModule, MatExpansionModule } from '@angular/material';



import { SignInComponent } from './sign-in/sign-in.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';


@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatExpansionModule,
    RouterModule.forChild([
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'change-password/:userId', component: ChangePasswordComponent }
    ])

  ],
  declarations: [ForgotPasswordComponent, ChangePasswordComponent ]
})
export class UserModule { }
