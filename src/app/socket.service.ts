import { Injectable } from '@angular/core';
import { AppService } from './app.service'


import * as io from 'socket.io-client';

import { Observable } from 'rxjs';


import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpErrorResponse, HttpParams } from "@angular/common/http";

@Injectable()
export class SocketService {

  // private url = 'http://localhost:3000';
  private url ='http://tracking-node.akshaypatil.online';


  private socket;

  constructor(public http: HttpClient, public appService: AppService) {
    // connection is being created.
    // that handshake
    this.socket = io(this.url);

  }

  // events to be listened 
  public verifyUser = () => {
    
    return Observable.create((observer) => {

      this.socket.on('verifyUser', (data) => {

        observer.next(data);

      }); // end Socket
    }); // end Observable
  } // end verifyUser



  public onlineUserList = () => {

    return Observable.create((observer) => {


      this.socket.on("online-user-list", (userList) => {

        observer.next(userList);

      }); // end Socket
    }); // end Observable
  } // end onlineUserList


  public disconnectedSocket = () => {

    return Observable.create((observer) => {

      this.socket.on("disconnect", () => {

        observer.next();

      }); // end Socket
    }); // end Observable


  } // end disconnectSocket
  // end events to be listened
  // events to be emitted
  public setUser = (authToken) => {

    this.socket.emit("set-user", authToken);

  } // end setUser


  public sendNotify = (notifyObject) => {
    
    this.socket.emit('notify', notifyObject);

  } // end send notify

  public notify = (userId) => {

    return Observable.create((observer) => {
      
      this.socket.on(userId, (data) => {

        observer.next(data);

      }); // end Socket
    }); // end Observable
  } // end notify




  // disconnect socket
  public exitSocket = () => {
    this.socket.emit('disconnect');
    
    this.socket.disconnect();


  }// end exit socket

  private handleError(err: HttpErrorResponse) {

    let errorMessage = '';

    if (err.error instanceof Error) {

      errorMessage = `An error occurred: ${err.error.message}`;

    } else {

      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;

    } // end condition *if
    console.error(errorMessage);

    return Observable.throw(errorMessage);

  }  // END handleError


}