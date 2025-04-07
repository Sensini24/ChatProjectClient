import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { UserRegister } from '../interfaces/IUserRegister';
import { UserLogin } from '../interfaces/IUserLogin';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})


export class AuthService {

  private connection : HubConnection | undefined;
  userIdReceived = new Subject<number>;
  userConnected = new Subject<any>
  userid:string = ""
  
  constructor(private http: HttpClient) {
    this.startConnection() 
  }

  apiUrlRegister:string = "https://localhost:7119/api/Auth/registerUser"
  apiUrlLogin:string = "https://localhost:7119/api/Auth/login"


  RegisterUser(userdto:UserRegister):Observable<UserRegister>{
    return this.http.post<UserRegister>(this.apiUrlRegister, userdto, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    })
  }

  LoginUser(logindata:UserLogin):Observable<any>{
    return this.http.post<any>(this.apiUrlLogin, logindata,{
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    })
  }

  public startConnection =()=>{
    this.connection = new HubConnectionBuilder()
    .withUrl("https://localhost:7119/identifyHub")
    .withAutomaticReconnect()
    .build();

    this.connection.start()
    .then(()=>{
      console.log("Conexion de auth establecida")
    })
    .catch(err=>{
      console.log("Error de conexion de auth: ", err)
    })

    this.connection.on("ReceiveUserId", (userId:string)=>{

      if(localStorage.getItem('userId')){
        localStorage.removeItem("userId");
      }
      this.setUser(userId)
      console.log("Id enviado a localstorage: ", userId)
      this.userid = userId
      // this.userIdReceived.next(userId);
    })


    this.connection?.on("UserConnected", (conections:any)=>{
      this.userConnected.next(conections);
    })

  }

  setUser(id: string) {
    localStorage.setItem('userId', id);
  }

  getUser() {
    return {
      id: localStorage.getItem('userId')
    };
  }


  
}
