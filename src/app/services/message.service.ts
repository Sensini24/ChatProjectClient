import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import * as signalR from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { ApiResponseChat, Chat } from '../interfaces/IChat';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  addMessage = new Subject<Chat>;
  apiUrlMessage:string = "https://localhost:7119/api/Chat/createChat"
  apiUrlGetChat:string = "https://localhost:7119/api/Chat/getPrivateChat2/"

  constructor(private http:HttpClient){}

  SendMessage(message:Chat):Observable<any>{
    return this.http.post<Chat>(this.apiUrlMessage, message, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    })
  }

  GetPrivateChat(nameChat:string, filasObtener:number):Observable<ApiResponseChat>{
    return this.http.get<ApiResponseChat>(this.apiUrlGetChat + nameChat + `/${filasObtener}`, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    })
  }

  
}
