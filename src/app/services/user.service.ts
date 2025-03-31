import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { ApiResponse, manyApiResponse, User } from '../interfaces/IUser';
import { Subject } from '@microsoft/signalr';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userSubject = new BehaviorSubject<ApiResponse | null>(null);
  public $user = this.userSubject.asObservable()

  private usersSubject = new BehaviorSubject<manyApiResponse | null>(null);
  public $users = this.usersSubject.asObservable()


  constructor(private http:HttpClient) { 
  }


  apiUrlUser: string = "https://localhost:7119/api/User/getUser"
  apiUrlAllUsers: string = "https://localhost:7119/api/User/getUsers"
  

  GetUser(userId:number):Observable<User>{
    return this.http.get<User>(this.apiUrlUser + `/${userId}`, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    })
  }

  ObtenerUser(userId:number):Observable<ApiResponse>{
    return this.http.get<ApiResponse>(this.apiUrlUser + `/${userId}`, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    }).pipe(
      tap(user => {
        this.userSubject.next(user);
      }),
      catchError(error => {
        console.error('Error cargando usuario', error);
        return throwError(() => error);
      })
    )
  }

  GetAllUsers():Observable<manyApiResponse>{
    return this.http.get<manyApiResponse>(this.apiUrlAllUsers, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    }).pipe(
      tap(users => {
        return this.usersSubject.next(users);
      }),
      catchError(error => {
        console.error('Error cargando usuario', error);
        return throwError(() => error);
      })
    )
  }


  getUserCurrent(userId:number):ApiResponse | null {
    return this.userSubject.getValue()
  }
}
