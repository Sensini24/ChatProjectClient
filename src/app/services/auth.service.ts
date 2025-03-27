import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRegister } from '../interfaces/IUserRegister';
import { UserLogin } from '../interfaces/IUserLogin';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  apiUrlRegister:string = "http://localhost:5021/api/Auth/registerUser"
  apiUrlLogin:string = "http://localhost:5021/api/Auth/login"


  RegisterUser(userdto:UserRegister):Observable<UserRegister>{
    return this.http.post<UserRegister>(this.apiUrlRegister, userdto, {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  LoginUser(logindata:UserLogin):Observable<any>{
    return this.http.post<any>(this.apiUrlLogin, logindata,{
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
