import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RoutesRecognized } from '@angular/router';
import { filter, pairwise, first } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { AppService } from "./../app.service";
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { PageEvent } from '@angular/material';
import { SocketService } from './../socket.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [SocketService]
})
export class HomeComponent implements OnInit {


  public authToken: string;
  public userId: string;
  public length: number;
  public pageSize: number = 10;
  public pageSizeOptions: number[] = [5, 10, 25, 100];
  pageIndex: number = 0;
  public sort: string = "createdOn.-1";
  public searchText: string;
  public cross: boolean = false;
  public none: boolean = false;
  issues: any;
  pageEvent: PageEvent;

  // socketservice varialbes
  public userList: any = [];
  public disconnectedSocket: boolean;
  noIssue: boolean;



  constructor(public SocketService: SocketService, public snackBar: MatSnackBar, public router: Router, public _route: ActivatedRoute, public appService: AppService) {
  }




  ngOnInit() {

    this.checkStatus();

    this.authToken = Cookie.get('authtoken');

    this.userId = this.appService.getUserInfoFromLocalstorage().userId;

    this.searchText = '';
    this.cross = false;

    this.getAllIssue(this.pageSize, this.pageIndex, this.sort);


    this.authToken = Cookie.get('authtoken');

    // Socket intialization
    this.verifyUserConfirmation();

    this.getOnlineUserList();

        //get notifications
        this.getNotify();

    // // previous url
    // this.router.events
    //   .pipe(filter((e: any) => e instanceof NavigationEnd),
    //     pairwise(),
    //     first()
    //   ).subscribe((e: any) => {

    //     if (e[0].url === '/sign-in') {
    //       // Socket intialization
    //       console.log(e[0].url);
    //       this.verifyUserConfirmation();

    //       this.getOnlineUserList();
    //     }
    //   });
  }

  ngOnDestroy() {

    this.SocketService.exitSocket()

  }


  // check to for validity
  public checkStatus: any = () => {

    if (Cookie.get('authtoken') === undefined || Cookie.get('authtoken') === '' || Cookie.get('authtoken') === null) {

      this.router.navigate(['/sign-in']);

      return false;

    } else {

      return true;

    }


  } // end checkStatus


  // socket event to verifyUser
  public verifyUserConfirmation: any = () => {

    this.SocketService.verifyUser()
      .subscribe(() => {
        this.disconnectedSocket = false;
        this.SocketService.setUser(this.authToken);
      });
  }


  // socket event to get online user list
  public getOnlineUserList: any = () => {

    this.SocketService.onlineUserList()
      .subscribe((userList) => {


        this.userList = [];

        for (let x in userList) {

          let temp = { 'userId': userList[x].userId, 'name': userList[x].fullName };

          this.userList.push(temp);

        }

        console.log('UserList =>', this.userList);

      }); // end online-user-list
  }




  public getServerData(event?: PageEvent) {

    this.getAllIssue(event.pageSize, event.pageIndex, this.sort)
    this.pageSize = event.pageSize

  }

  search(e) {
    this.cross = true;

    this.appService.searchIssue(this.searchText).subscribe(data => {
      let response = data['data']
      this.length = data['count']

      if (data['status'] == 200) {
        this.issues = []
        this.issues = response;


      } else if (data['status'] == 404) {
        this.none = true
        this.snackBar.open(`${data['message']}.`, "Dismiss", {
          duration: 2000,
        });

        setTimeout(() => {

          this.none = false

        }, 5000);

      } else {

        this.snackBar.open(`some error occured`, "Dismiss", {
          duration: 5000,
        });

        setTimeout(() => {
          this.router.navigate(['/500'])
        }, 500);

      }

    }, () => {
    });

  }


  getAllIssue(pageSize, pageIndex, sort) {

    this.appService.getAllIssue(pageSize, pageIndex, sort).subscribe(data => {

      let response = data['data']
      this.length = data['count']

      if (data['status'] == 200) {


        this.issues = response;

      } else if (data['status'] == 404) {
        
        this.noIssue = true;

        this.snackBar.open(`${data['message']}. Please add issues`, "Dismiss", {
          duration: 2000,
        });


      } else {

        this.snackBar.open(`some error occured`, "Dismiss", {
          duration: 5000,
        });

        setTimeout(() => {
          this.router.navigate(['/500'])
        }, 500);

      }

    }, () => {
      this.snackBar.open(`some error occured`, "Dismiss", {
        duration: 5000,
      });
      setTimeout(() => {
        this.router.navigate(['/500']);
      }, 500);
    });

  }




  // Sorting function
  sortBy(type: string) {

    if (type == "title") {
      if (this.sort == "title.1") {
        this.sort = 'title.-1'
      } else {
        this.sort = 'title.1'
      }

    } else if (type == "reporter") {
      if (this.sort == "reporter.1") {
        this.sort = 'reporter.-1'
      } else {
        this.sort = 'reporter.1'
      }

    } else if (type == "status") {
      if (this.sort == "status.1") {
        this.sort = 'status.-1'
      } else {
        this.sort = 'status.1'
      }

    } else {
      if (this.sort == "createdOn.1") {
        this.sort = 'createdOn.-1'
      } else {
        this.sort = 'createdOn.1'
      }
    }

    this.getAllIssue(this.pageSize, this.pageIndex, this.sort);

  }


   // get notifications of the user
   public getNotify: any = () => {

    this.SocketService.notify(this.userId)
        .subscribe((data) => {

            let message = data;

            this.snackBar.open(`${message.message}`, "Dismiss", {
                duration: 5000,
            });
          

        }, (err) => {

            this.snackBar.open(`some error occured`, "Dismiss", {
                duration: 5000,
            });

            setTimeout(() => {
                this.router.navigate(['/500'])
            }, 500);

        });//end subscribe

}// end get message from a user 


}
