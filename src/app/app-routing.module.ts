import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SignInComponent } from './user/sign-in/sign-in.component';
import { DescriptionComponent } from './description/description.component';
import { Err500Component } from './err500/err500.component';


const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'sign-in',
    component: SignInComponent
  },
  {
    path: 'description/:type',
    component: DescriptionComponent
  },
  {
    path: '500',
    component: Err500Component
  },
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
