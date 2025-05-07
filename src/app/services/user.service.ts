import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, tap, throwError } from 'rxjs';
import { ApiResponse, ApiResponseDTO, manyApiResponse, User, UserDTO } from '../interfaces/IUser';
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

  private userCurrentSubject = new BehaviorSubject<ApiResponse | null>(null);
  public $userCurrent = this.userCurrentSubject.asObservable()

  private findUsersSubject = new BehaviorSubject<ApiResponseDTO | null>(null);
  public $findUsers = this.findUsersSubject.asObservable()
  user: User | undefined
  userCurrent: User | undefined
  constructor(private http: HttpClient, private authService: AuthService) {
    this.ObtenerUsuarioActual()
    this.GetAllUsers()
  }


  apiUrlUser: string = "https://localhost:7119/api/User/getUser"
  apiUrlCurrentUser: string = "https://localhost:7119/api/User/getCurrentUser"
  apiUrlAllUsers: string = "https://localhost:7119/api/User/getUsers"
  apiUrlsFindusers: string = "https://localhost:7119/api/User/findUser"


  GetUser(userId: number): Observable<User> {
    return this.http.get<User>(this.apiUrlUser + `/${userId}`, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    })
  }

  ObtenerUsuarioActual(): void {

    this.http.get<ApiResponse>(this.apiUrlCurrentUser, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    })
      .pipe(
        tap(user => {

          this.userCurrent = {
            userId: user.userdto.userId,
            username: user.userdto.username,
            email: user.userdto.email,
            gender: this.obtenerGenero(Number(user.userdto.gender))
          };
          this.userCurrentSubject.next(user)
        }),
        catchError(error => {
          console.error('Error cargando usuario', error);
          return throwError(() => error);
        })
      ).subscribe();
  }


  // ObtenerUser():Observable<ApiResponse>{
  //   const userIdService = this.authService.getUser();
  //   const userId = parseInt(userIdService?.userid ?? '0');
  //   return this.http.get<ApiResponse>(this.apiUrlUser + `/${userId}`, {
  //     headers: { 'Content-Type': 'application/json' },
  //     withCredentials: true
  //   }).pipe(
  //     tap(user => {
  //       this.user = {
  //         userId: user.userdto.userId,
  //         username: user.userdto.username,
  //         email: user.userdto.email,
  //         gender: this.obtenerGenero(Number(user.userdto.gender))
  //       };
  //       this.userSubject.next(user);
  //     }),
  //     catchError(error => {
  //       console.error('Error cargando usuario', error);
  //       return throwError(() => error);
  //     })
  //   )
  // }

  GetAllUsers(): void {
    this.http.get<manyApiResponse>(this.apiUrlAllUsers, {
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
    ).subscribe()
  }

  FindUsersForContacts(initials: string): Observable<ApiResponseDTO | null> {
    return this.http.get<ApiResponseDTO>(this.apiUrlsFindusers + `/${initials}`, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    }).pipe(
      tap(users => {
        this.findUsersSubject.next(users);
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


  getUserCurrent(): ApiResponse | null {
    return this.userSubject.getValue()
  }

  obtenerGenero(numero: number): string {
    const generos = ["Masculino", "Femenino", "Otros"]
    return generos[numero] ?? "Desconocido"
  }
}
