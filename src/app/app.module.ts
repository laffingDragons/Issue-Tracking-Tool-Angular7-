import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule, MatSnackBarModule, MatChipsModule, MatBadgeModule, MatPaginatorModule, MatTooltipModule, MatExpansionModule, MatSelectModule, MatCheckboxModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatCardModule, MatProgressBarModule, MatSlideToggleModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { NgxEditorModule } from 'ngx-editor';


import { AppRoutingModule } from './app-routing.module';
import { AppService } from './app.service';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HomeComponent } from './home/home.component';
import { SignInComponent } from './user/sign-in/sign-in.component';
import { UserModule } from './user/user.module';
import { DescriptionComponent } from './description/description.component';
import { SocketService } from "./socket.service";
import { Err500Component } from './err500/err500.component';



import {
  SocialLoginModule,
  AuthServiceConfig,
  GoogleLoginProvider,
  FacebookLoginProvider,
 
} from "angular-6-social-login-v2";

// Configs 
export function getAuthServiceConfigs() {
  let config = new AuthServiceConfig(
      [
        {
          id: FacebookLoginProvider.PROVIDER_ID,
          //add facebook client Id below
          provider: new FacebookLoginProvider(" ")
        },
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          //add google client Id below
          provider: new GoogleLoginProvider(" ")
        },
       
      ]
  );
  return config;
}


@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HomeComponent,
    SignInComponent,
    DescriptionComponent,
    Err500Component,
   
  ],
  imports: [
    BrowserModule,
    UserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SocialLoginModule,
    FormsModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatExpansionModule,
    MatSelectModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatCardModule,
    MatProgressBarModule,
    NgxEditorModule ,
  ],
  providers: [AppService,
    SocketService,
     {
    provide: AuthServiceConfig,
    useFactory: getAuthServiceConfigs
  } ],
  bootstrap: [AppComponent]
})
export class AppModule { }
