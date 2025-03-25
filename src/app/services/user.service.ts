import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../interfaces/IUser';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http:HttpClient) { }

  apiUrl: string = "https://localhost:7119/api/User/getUsers"
  GetUsers():Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl)
  }
}
