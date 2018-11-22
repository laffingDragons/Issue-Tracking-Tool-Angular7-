import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cookie } from 'ng2-cookies/ng2-cookies';


import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpErrorResponse, HttpParams } from "@angular/common/http";
import { stringify } from 'querystring';


@Injectable()
export class AppService {

  public url = 'http://localhost:3000';
  // private url ='http://tracking-node.akshaypatil.online';


  constructor(public http: HttpClient) { }


  // get all countries
  public getAllCountry() {

    let response = this.http.get(`https://restcountries.eu/rest/v2/all`);

    return response;

  }

  // get country form code
  public getCountry(code) {

    let response = this.http.get(`https://restcountries.eu/rest/v2/callingcode/${code}`);

    return response;

  }


  //get userinfo from localstoreage
  public getUserInfoFromLocalstorage = () => {

    return JSON.parse(localStorage.getItem('userInfo'));

  } // end getUserInfoFromLocalstorage

  //set userInfo in local storage
  public setUserInfoInLocalStorage = (data) => {

    localStorage.setItem('userInfo', JSON.stringify(data))

  }


  //get all users
  public getAllUsers() {

    let response = this.http.get(`${this.url}/api/v1/users/view/all?authToken=${Cookie.get('authtoken')}`);

    return response;

  }

  //get users details
  public getUserInfo(id) {

    let response = this.http.get(`${this.url}/api/v1/users/${id}/details?authToken=${Cookie.get('authtoken')}`);

    return response;

  }


  //signup 
  public signupFunction(data): Observable<any> {

    const params = new HttpParams()
      .set('firstName', data.firstName)
      .set('lastName', data.lastName)
      .set('type', data.type)
      .set('email', data.email)
      .set('password', data.password)

    return this.http.post(`${this.url}/api/v1/users/signup`, params);

  } // end of signupFunction function.

  //signup 
  public socialSignupFunction(data): Observable<any> {

    const params = new HttpParams()
      .set('firstName', data.firstName)
      .set('lastName', data.lastName)
      .set('type', data.type)
      .set('email', data.email)
    // .set('password', data.password)

    return this.http.post(`${this.url}/api/v1/users/socialSignup`, params);

  } // end of signupFunction function.



  public signinFunction(data): Observable<any> {

    const params = new HttpParams()
      .set('email', data.email)
      .set('password', data.password);

    return this.http.post(`${this.url}/api/v1/users/login`, params);

  } // end of signinFunction function.


  public forgotPasswordFunction(data): Observable<any> {

    const params = new HttpParams()
      .set('email', data.email)

    return this.http.post(`${this.url}/api/v1/users/forgot-password`, params);

  } // end of forgotPasswordFunction function.



  // change password
  public changePasswordFunction(data): Observable<any> {

    const params = new HttpParams()
      .set('userId', data.userId)
      .set('password', data.password);

    return this.http.put(`${this.url}/api/v1/users/change-password`, params);

  } // end of signinFunction function.


  public logout(data): Observable<any> {

    const params = new HttpParams()

      .set('authToken', Cookie.get('authtoken'))
      .set('userId', data)

    return this.http.post(`${this.url}/api/v1/users/logout`, params);

  } // end logout function


  //////////////////////////Issue related api///////////////////////////////


  //upload Issue
  public createIssue(data) {

    // Creating a user obj for repoter info
    let reporter = [];
    let name = `${this.getUserInfoFromLocalstorage().firstName} ${this.getUserInfoFromLocalstorage().lastName}`
    let userId = this.getUserInfoFromLocalstorage().userId
    let reporterObj = {
      name: name,
      userId: userId
    }
    reporter.push(reporterObj);

    // stringify the object for sending
    let reporterArray = JSON.stringify(reporter)

    // stringify the object for sending
    let assigneeArray = JSON.stringify(data.assignee)


    const fd = new FormData();
    fd.append('image', data.screenshot)
    fd.append('title', data.title)
    fd.append('status', data.status)
    fd.append('description', data.description)
    fd.append('assignee', assigneeArray)
    fd.append('reporter', reporterArray)

    return this.http.post(`${this.url}/api/v1/issue/create`, fd, {
      reportProgress: true,
      observe: 'events'
    });
  }

  //upload Issue
  public editIssue(data) {


    // stringify the object for sending
    let assigneeArray = JSON.stringify(data.assignee)
    let reportArray = JSON.stringify(data.reporter)

    const fd = new FormData();
    fd.append('image', data.screenshot)
    fd.append('title', data.title)
    fd.append('status', data.status)
    fd.append('description', data.description)
    fd.append('assignee', assigneeArray)
    fd.append('reporter', reportArray)
    fd.append('previous', data.previous)

    return this.http.post(`${this.url}/api/v1/issue/${data.id}/edit`, fd, {
      reportProgress: true,
      observe: 'events'
    });
  }



  //get all Issue
  public getAllIssue(pageSize, pageIndex, sort) {

    let response = this.http.get(`${this.url}/api/v1/issue/all?pageSize=${pageSize}&pageIndex=${pageIndex}&sort=${sort}&authToken=${Cookie.get('authtoken')}`);

    return response;

  }
  //end of get all issue


  //search Issue
  public searchIssue(name) {

    let response = this.http.get(`${this.url}/api/v1/issue/${name}/search?authToken=${Cookie.get('authtoken')}`);

    return response;

  }
  //end of search issue


  //get users details
  public getIssueInfo(id) {

    let response = this.http.get(`${this.url}/api/v1/issue/${id}/view?authToken=${Cookie.get('authtoken')}`);

    return response;

  }

  /**
   * post a commet
   */
  public postComment(data) {

    // Creating a user obj for repoter info
    let reporter = [];
    let name = `${this.getUserInfoFromLocalstorage().firstName} ${this.getUserInfoFromLocalstorage().lastName}`
    let userId = this.getUserInfoFromLocalstorage().userId
    let reporterObj = {
      name: name,
      userId: userId,
      comment : data.comment
    }
    reporter.push(reporterObj);
    let reportArray = JSON.stringify(reporterObj)


    const params = new HttpParams()
      .set('comment', reportArray)
      .set('authToken', Cookie.get('authtoken'))

    return this.http.post(`${this.url}/api/v1/issue/${data.id}/addComment`, params);

  }

    /**
   * Add as watching
   */
  public addWatchee(id) {

    // Creating a user obj for repoter info
    let reporter = [];
    let name = `${this.getUserInfoFromLocalstorage().firstName} ${this.getUserInfoFromLocalstorage().lastName}`
    let userId = this.getUserInfoFromLocalstorage().userId
    let reporterObj = {
      name: name,
      userId: userId,
    }
    reporter.push(reporterObj);
    let reportArray = JSON.stringify(reporterObj)


    const params = new HttpParams()
      .set('watching', reportArray)
      .set('authToken', Cookie.get('authtoken'))

    return this.http.post(`${this.url}/api/v1/issue/${id}/addWatchee`, params);

  }


  /**
   * Add Assignee
   */
  public addAssignee(data) {

    let assigneeArray = JSON.stringify(data.assignee)

    const params = new HttpParams()
    .set('assignee', assigneeArray)
    .set('authToken', Cookie.get('authtoken'))

  return this.http.post(`${this.url}/api/v1/issue/${data.id}/addAssignee`, params);

  }


     /**
   * Add as watching
   */
  public delete(id, pervious) {


    const params = new HttpParams()
      .set('previous', pervious)
      .set('authToken', Cookie.get('authtoken'))

    return this.http.post(`${this.url}/api/v1/issue/${id}/delete`, params);

  }

  //get notification for user
  public getUserNotification(id) {

    let response = this.http.get(`${this.url}/api/v1/issue/${id}/notification?authToken=${Cookie.get('authtoken')}`);

    return response;

  }



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