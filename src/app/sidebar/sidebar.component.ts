import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { AppService } from "./../app.service";
import { SocketService } from './../socket.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    providers: [SocketService]
})
export class SidebarComponent implements OnInit {

    currentUrl: string;
    notifications: any[];
    count: number = null;
    userId: any;
    noNotify: boolean = false;

    constructor(public SocketService: SocketService, public snackBar: MatSnackBar, public router: Router, public _route: ActivatedRoute, public appService: AppService) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.currentUrl = event.url
            }
        })
    }

    ngOnInit() {

        //get notifications
        this.getNotify();
    }

    // logout Function
    public logout: any = () => {

        this.userId = this.appService.getUserInfoFromLocalstorage().userId
        
        this.appService.logout(this.userId)
        .subscribe((apiResponse) => {
            
            if (apiResponse.status === 200) {

                this.SocketService.exitSocket()
                
                    Cookie.delete('authtoken');

                    this.router.navigate(['/sign-in']);

                } else {
                    this.snackBar.open(`${apiResponse.message}`, "Dismiss", {
                        duration: 5000,
                    });

                } // end condition

            }, (err) => {
                this.snackBar.open(`some error occured`, "Dismiss", {
                    duration: 5000,
                });

                setTimeout(() => {
                    this.router.navigate(['/500'])
                }, 500);

            });

    } // end logout



    //code to get last 10 notification
    getNotification(id) {

        this.notifications = [];

        this.noNotify = false;

        this.appService.getUserNotification(id).subscribe(
            data => {

                if (data["status"] === 200) {
                let response = data['data']

                this.notifications = []
                if (response != null) {
                    response.map(x => {
                        this.notifications.unshift(x);
                    });
                }


            }else if (data["status"] === 404){

                this.noNotify = true;

            }else{

                this.snackBar.open(`some error occured`, "Dismiss", {
                    duration: 5000,
                  });
        
                  setTimeout(() => {
                    this.router.navigate(['/500'])
                  }, 500);
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

    // get notifications of the user
    public getNotify: any = () => {
        
        this.userId = this.appService.getUserInfoFromLocalstorage().userId

        this.SocketService.notify(this.userId)
            .subscribe((data) => {

                this.noNotify = false;

                let message = data;
                this.notifications.unshift(message)
                this.count++;

            }, (err) => {

                this.snackBar.open(`some error occured`, "Dismiss", {
                    duration: 5000,
                });

                setTimeout(() => {
                    this.router.navigate(['/500'])
                }, 500);

            });//end subscribe

    }// end get message from a user 


    /**
     * clearNotify
     */
    public clearNotify() {

        this.userId = this.appService.getUserInfoFromLocalstorage().userId

        this.count = null;

        this.getNotification(this.userId)
    }

}
