import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { AppService } from './../app.service';
import { HttpEventType } from '@angular/common/http';
import { Location } from '@angular/common';
import { SocketService } from './../socket.service';


@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.scss'],
  providers: [SocketService]
})
export class DescriptionComponent implements OnInit {


  public editorContent: string;
  public selectFile: File = null;
  public imageUrl: string;
  public title: string;
  public status: string;
  public warning: boolean = false;
  public assignee = new FormControl();

  editorConfig = {
    "editable": true,
    "spellcheck": true,
    "height": "auto",
    "minHeight": "0",
    "width": "auto",
    "minWidth": "0",
    "translate": "yes",
    "enableToolbar": true,
    "showToolbar": true,
    "placeholder": "Enter text here...",
    "imageEndPoint": "",
    "toolbar": [
      ["bold", "italic", "underline", "strikeThrough", "superscript", "subscript"],
      ["fontName", "fontSize", "color"],
      ["justifyLeft", "justifyCenter", "justifyRight", "justifyFull", "indent", "outdent"],
      ["cut", "copy", "delete", "removeFormat", "undo", "redo"],
      ["paragraph", "blockquote", "removeBlockquote", "horizontalLine", "orderedList", "unorderedList"],
      ["link", "unlink"]
    ]
  }
  message: string;
  currentUrl: string;
  editMode: boolean = true;
  users = [];
  uploadStautus: boolean = false;
  progress: number;
  userId: any;
  mySelect: any[];
  reporterId: any;
  assigneeDisabled: any[];
  anotherList: any[];
  reporter: any;
  previous: any;
  comment: string;
  commentsArray: any;
  watchee: boolean = false;
  watchers: any;
  assigneeArray = [];
  name: string;
  userList: any;
  disconnectedSocket: boolean;
  authToken: string;

  constructor(public SocketService: SocketService, private location: Location, public appService: AppService, public snackBar: MatSnackBar, public router: Router, public _route: ActivatedRoute, ) {

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.url
        this.currentUrl = this.currentUrl.split('/')[2]
        if (this.currentUrl == 'add') {
          this.editMode = false;
          this.clear()
        }
      }
    })
  }

  ngOnInit() {

    this.checkStatus();

    this.getALLUsers();

    this.userId = this.appService.getUserInfoFromLocalstorage().userId;
    this.name = `${this.appService.getUserInfoFromLocalstorage().firstName} ${this.appService.getUserInfoFromLocalstorage().lastName}`

    if (this.currentUrl != "add") {

      this.getIssueDetails()
    }

    this.authToken = Cookie.get('authtoken');

    // Socket intialization
    this.verifyUserConfirmation();

    this.getOnlineUserList();

    //get notifications
    this.getNotify();


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

        console.log('UserList>>>>>', this.userList);

      }); // end online-user-list
  }


  onFileSelected(event) {
    this.warning = false
    this.selectFile = <File>event.target.files[0];

    if (this.selectFile) {

      let reader = new FileReader();
      reader.onload = (event: any) => {
        this.imageUrl = event.target.result;
      }
      reader.readAsDataURL(this.selectFile);

      if (this.selectFile.size > 5000000) {
        this.warning = true

        this.message = "Please make sure your image is less than 5Mb for ensuring the performance of the app"

      }

      if (this.selectFile.type == "image/png" || this.selectFile.type == "image/jpeg") {

      } else {
        this.warning = true

        this.message = "Please make sure your image format is Jpeg/Png"

      }

    }

  }


  // Get all users
  getALLUsers() {

    this.appService.getAllUsers().subscribe(
      data => {

        let userArray = data['data'];
        setTimeout(() => {
          userArray.filter(x => {
            let userObj = {
              name: `${x.firstName} ${x.lastName}`,
              userId: x.userId
            }
            if (x.userId != this.appService.getUserInfoFromLocalstorage().userId && x.userId != this.reporterId) {
              this.users.push(userObj)
            }
          })
        }, 2000);

      }, (err) => {

        this.snackBar.open(`some error occured`, "Dismiss", {
          duration: 5000,
        });

        setTimeout(() => {
          this.router.navigate(['/500'])
        }, 500);

      });

  }//end of get all users.


  /**
   * save
   */
  public save() {

    if (!this.editMode) {

      if (!this.title) {

        this.snackBar.open(`Enter Title Name`, "Dismiss", {
          duration: 5000,
        })

      } else if (!this.status) {
        this.snackBar.open(`Select Status`, "Dismiss", {
          duration: 5000,
        })
      } else if (!this.editorContent) {

        this.snackBar.open(`Enter Description`, "Dismiss", {
          duration: 5000,
        })

      } else if (!this.selectFile) {

        this.snackBar.open(`Select Image`, "Dismiss", {
          duration: 5000,
        })

      } else if (!this.assignee.value || this.assignee.value.length == 0) {

        this.snackBar.open(`Add atleast one assignee`, "Dismiss", {
          duration: 5000,
        })
      } else {
        let data = {
          title: this.title,
          status: this.status,
          description: this.editorContent,
          assignee: this.assignee.value,
          screenshot: this.selectFile,
        }

        this.appService.createIssue(data).subscribe(event => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadStautus = true;
            this.progress = Math.round(event.loaded / event.total * 100)
            this.snackBar.open(`Upload Progress : ${Math.round(event.loaded / event.total * 100)}%`, "Dismiss", {
              duration: 5000,
            })

          } else if (event.type === HttpEventType.Response) {


            if (event.body['status'] === 200) {

              this.snackBar.open(`${event.body['message']}.`, "Dismiss", {
                duration: 5000,
              });
              setTimeout(() => {
                this.router.navigate(['/home'])
              }, 1000);

            } else if (event.body['status'] === 404) {

              this.snackBar.open(`${event.body['message']}`, "Dismiss", {
                duration: 5000,
              });


            } else {

              this.snackBar.open(`${event.body['message']}`, "Dismiss", {
                duration: 5000,
              });

              setTimeout(() => {
                this.router.navigate(['/500'])
              }, 500);

            }
          }
        })
      }

    } else {
      ////////////////////////////For Editing//////////////////////////
      if (!this.title) {

        this.snackBar.open(`Enter Title Name`, "Dismiss", {
          duration: 5000,
        })

      } else if (!this.status) {
        this.snackBar.open(`Select Status`, "Dismiss", {
          duration: 5000,
        })
      } else if (!this.editorContent) {

        this.snackBar.open(`Enter Description`, "Dismiss", {
          duration: 5000,
        })


      } else if (!this.assignee.value || this.assignee.value.length == 0) {

        this.snackBar.open(`Add atleast one assignee`, "Dismiss", {
          duration: 5000,
        })
      } else {
        let assigneeArray = this.assignee.value

        if (this.userId !== this.reporterId) {
          let obj = {
            name: this.name,
            userId: this.userId
          }
          assigneeArray.push(obj);
        }

        let data = {
          title: this.title,
          status: this.status,
          description: this.editorContent,
          assignee: assigneeArray,
          screenshot: this.selectFile,
          reporter: this.reporter,
          previous: this.previous,
          id: this.currentUrl
        }

        this.appService.editIssue(data).subscribe(event => {

          if (event.type === HttpEventType.UploadProgress) {

            this.progress = Math.round(event.loaded / event.total * 100)
            this.snackBar.open(`Upload Progress : ${Math.round(event.loaded / event.total * 100)}%`, "Dismiss", {
              duration: 5000,
            })

          } else if (event.type === HttpEventType.Response) {

            if (event.body['status'] === 200) {

              this.snackBar.open(`${event.body['message']}.`, "Dismiss", {
                duration: 5000,
              });


              this.notify(`${this.name} has Edited ${data.title}`);

              setTimeout(() => {
                this.router.navigate(['/home'])
              }, 1000);


            } else if (event.body['status'] === 404) {

              this.snackBar.open(`${event.body['message']}`, "Dismiss", {
                duration: 5000,
              });


            } else {

              this.snackBar.open(`${event.body['message']}`, "Dismiss", {
                duration: 5000,
              });

              setTimeout(() => {
                this.router.navigate(['/500'])
              }, 500);

            }
          }
        })
      }

    }

  }



  //getting ISsue details to pre render values
  getIssueDetails() {

    this.appService.getIssueInfo(this.currentUrl).subscribe(
      data => {

        if (data['status'] == 200) {
          let response = data['data']
          this.imageUrl = `http://localhost:3000/uploads/${response.screenshot}`
          // this.imageUrl = `http://tracking-node.akshaypatil.online/uploads/${response.screenshot}`
          this.title = response.title
          this.status = response.status
          this.editorContent = response.description
          this.reporterId = response.reporter[0].userId
          this.reporter = response.reporter
          this.previous = response.screenshot
          this.commentsArray = response.comments
          this.watchers = response.watching


          // To check userId of assignee and give them rights to edit
          response.assignee.filter(x => this.assigneeArray.push(x.userId));


          response.watching.filter(x => {
            if (x.userId == this.userId) {
              this.watchee = true;
            }
          })

          setTimeout(() => {

            this.anotherList = [];

            response.assignee.filter(x => {
              for (let y of this.users) {
                if (y.userId == x.userId) {

                  // for Default Checking of value
                  this.anotherList.push(y);

                }
              }
            });

            this.assignee.setValue(this.anotherList);
          }, 3000);

        } else {
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


  /**
   * postComment
   */
  public postComment() {

    if (this.comment) {

      let data = {
        id: this.currentUrl,
        comment: this.comment
      }
      this.appService.postComment(data).subscribe(
        data => {

          if (data['status'] == 200) {

            this.notify(`${this.name} has Commented ${this.comment} on ${this.title}`);


            this.snackBar.open(`${data['message']}`, "Dismiss", {
              duration: 5000,
            });

            this.router.navigate(['/home'])


          } else {
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

    } else {

      this.snackBar.open(`Comment box empty!`, "Dismiss", {
        duration: 5000,
      });

    }
  }


  /**
   * Add Assignee
   */
  public addAssignee() {
    let data = {
      assignee: this.assignee.value,
      id: this.currentUrl
    }

    this.appService.addAssignee(data).subscribe(
      data => {

        if (data['status'] == 200) {
          // this.router.navigate(['/home'])
          this.notify(`${this.name} has Added Assignee on ${this.title}`);


          this.snackBar.open(`${data['message']}`, "Dismiss", {
            duration: 5000,
          });


        } else {
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

  /**
   * Add as WatchIng
   */
  public addWatchee() {

    this.appService.addWatchee(this.currentUrl).subscribe(
      data => {

        if (data['status'] == 200) {
          this.watchee = true;

          this.notify(`${this.name} has Subscribed to ${this.title}`);


          this.snackBar.open(`${data['message']}`, "Dismiss", {
            duration: 5000,
          });


        } else {
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


  delete() {
    this.appService.delete(this.currentUrl, this.imageUrl).subscribe(
      data => {

        if (data['status'] == 200) {

          this.snackBar.open(`${data['message']}`, "Dismiss", {
            duration: 5000,
          });
          setTimeout(() => {
            this.router.navigate(['/home'])
          }, 500);

        } else {
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



  /**
   * notify
   */
  public notify(message) {
    // sending notification to watchers
    this.watchers.filter(x => {

      let notifyObj = {

        senderName: this.name,
        senderId: this.userId,
        receiverName: x.name,
        receiverId: x.userId,
        issueId: this.currentUrl,
        message: message,

      }

      this.SocketService.sendNotify(notifyObj)

    })


    //sending notification to assignee's
    this.users.filter(x => {

      let notifyObj = {

        senderName: this.name,
        senderId: this.userId,
        receiverName: x.name,
        receiverId: x.userId,
        issueId: this.currentUrl,
        message: message,

      }

      this.SocketService.sendNotify(notifyObj)
    })


    //sending notifications to Reporter
    if (this.userId != this.reporterId) {
      let notifyObj = {

        senderName: this.name,
        senderId: this.userId,
        receiverName: this.reporter[0].name,
        receiverId: this.reporterId,
        issueId: this.currentUrl,
        message: message,

      }

      this.SocketService.sendNotify(notifyObj)
    }


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




  clear() {
    this.title = ''
    this.status = '',
      this.editorContent = "",
      this.imageUrl = '',
      this.assignee.setValue([])
  }

  goBack() {
    this.location.back();
  }


}
