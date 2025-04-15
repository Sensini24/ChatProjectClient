import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, catchError, Observable, Subject, switchMap, tap, throwError } from 'rxjs';
import { ApiResponseChat, Chat, Message } from '../interfaces/IChat';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  addMessage = new Subject<Chat>;
  apiUrlMessage:string = "https://localhost:7119/api/Chat/createChat"
  apiUrlGetChat:string = "https://localhost:7119/api/Chat/getPrivateChat2/"
  messagesCache:Map<string, any> = new Map()

  private privateChatSubject = new BehaviorSubject<any | null>(null);
  // public $privateChat = this.privateChatSubject.asObservable()

  constructor(private http:HttpClient){}

  SendMessage(message:Chat):Observable<any>{
    return this.http.post<Chat>(this.apiUrlMessage, message, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    })
  }

  private GetPrivateChat(nameChat: string, filasObtener: number): Observable<any> {
    return this.http.get<any>(this.apiUrlGetChat + nameChat + `/${filasObtener}`, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });
  }

  // Método para cargar los chats privados con parámetros
  loadPrivateChat(nameChat: string, filasObtener: number): Observable<any> {
    if(this.messagesCache.has(nameChat)){
      console.log("Mensajes obtenidos desde caché: ", this.messagesCache.get(nameChat), this.messagesCache);
      return new Observable(subscriber => {
        subscriber.next(this.messagesCache.get(nameChat));
        subscriber.complete();
      });
    }
    return this.GetPrivateChat(nameChat, filasObtener).pipe(
      tap(messages => {
        this.messagesCache.set(nameChat, messages); // Almacena directamente 'messages'
        console.log("Mensajes obtenidos desde servidor: ", messages);
      })
    );
  }



  addMessageToCache(nameChat: string, newMessage: any): void {
    const cachedMessages = this.messagesCache.get(nameChat);
    console.log("TIpo de cahce: ", cachedMessages)
    if (cachedMessages && cachedMessages.chatDto) {
      cachedMessages.chatDto.messages.push(newMessage);
      this.messagesCache.set(nameChat, cachedMessages);
      this.privateChatSubject.next(cachedMessages);
    } else {
      console.error('Error: Invalid structure in cached data for adding message.');
    }
  }
  
}
