import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { ApiResponse, manyApiResponse, User } from '../interfaces/IUser';
import { Subject } from '@microsoft/signalr';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userSubject = new BehaviorSubject<ApiResponse | null>(null);
  public $user = this.userSubject.asObservable()

  private usersSubject = new BehaviorSubject<manyApiResponse | null>(null);
  public $users = this.usersSubject.asObservable()
  user:User | undefined

  constructor(private http:HttpClient, private authService: AuthService) { 
  }


  apiUrlUser: string = "https://localhost:7119/api/User/getUser"
  apiUrlAllUsers: string = "https://localhost:7119/api/User/getUsers"
  
  

  GetUser(userId:number):Observable<User>{
    return this.http.get<User>(this.apiUrlUser + `/${userId}`, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    })
  }

  

  ObtenerUser():Observable<ApiResponse>{
    const userIdService = this.authService.getUser();
    const userId = parseInt(userIdService?.id ?? '0');
    return this.http.get<ApiResponse>(this.apiUrlUser + `/${userId}`, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    }).pipe(
      tap(user => {
        this.user = {
          userId: user.userdto.userId,
          username: user.userdto.username,
          email: user.userdto.email,
          gender: this.obtenerGenero(Number(user.userdto.gender))
        };
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


  // private async loadUserData(): Promise<void> {
  //   const userIdService = this.authService.getUser();
  //   const userId = parseInt(userIdService?.id ?? '0');

  //   this.GetUser(userId).subscribe({
  //     next: (data: any) => {
  //       if (data?.userdto) {
  //         const apiResponse: ApiResponse = {
  //           success: true,
  //           userdto: {
  //             userId: data.userdto.userId,
  //             username: data.userdto.username,
  //             email: data.userdto.email,
  //             gender: data.userdto.gender,
  //           },
  //         };
  //         this.userSubject.next(apiResponse);
  //       } else {
  //         this.userSubject.next(null);
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error al cargar los datos del usuario:', error);
  //       this.userSubject.next(null);
  //     }
  //   });
    
  // }


  getUserCurrent():ApiResponse | null {
    return this.userSubject.getValue()
  }

  obtenerGenero(numero:number):string{
    const generos = ["Masculino", "Femenino", "Otros"]
    return generos[numero] ?? "Desconocido"
  }
}
