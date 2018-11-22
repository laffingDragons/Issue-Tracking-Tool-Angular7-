import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from './../../app.service';
import { MatSnackBar } from '@angular/material';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})

export class ForgotPasswordComponent implements OnInit {

  statusBar: HTMLElement;
  public email: any;

  constructor(public snackBar: MatSnackBar, public appService: AppService, public router: Router, ) { 
    this.statusBar = document.getElementById('zap');
  }


 
  ngOnInit() {
    this.statusBar.style.display = 'none';

  }

  ngOnDestroy(){
    this.statusBar.style.display = 'block';
    
  }
 //Validations
 isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
  const isSubmitted = form && form.submitted;
  return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
}

emailFormControl = new FormControl('', [
  Validators.required,
  Validators.email,
]);

matcher = new MyErrorStateMatcher();


public submit: any = () => {

  if (!this.email) {

    this.snackBar.open(`Please enter email`, "Dismiss", {
      duration: 5000,
    });

  } else {

    let data = {
      email: this.email
    }

    this.appService.forgotPasswordFunction(data)
      .subscribe((apiResponse) => {

        if (apiResponse.status === 200) {
          this.snackBar.open(`${apiResponse.message}`, "Dismiss", {
            duration: 5000,
          });

          setTimeout(() => {

            this.router.navigate(['/sign-in']);

          }, 2000);

        } else {

          this.snackBar.open(`${apiResponse.message}`, "Dismiss", {
            duration: 5000,
          });

        }

      }, (err) => {

        this.snackBar.open(`some error occured`, "Dismiss", {
          duration: 5000,
        });
        setTimeout(() => {
          this.router.navigate(['/500'])
        }, 500);


      });

  }

}
}