import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
// import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  // private hubConnection:signalR.HubConnection | undefined;
  private connection : HubConnection | undefined;
  public messageReceived = new Subject<{user:string, message:string, userId:number, connectionId:string}>();
  public userConnected = new Subject<any>();
  public userDisconnected = new Subject<any>();

  


  //? He creado un observable para esperar cuando se obtenga el connection id, y cuando se lo obtiene se lo almacena en una variable publica, para poder ser obtenido en todos lados.
  private connectionIdSubject = new BehaviorSubject<string | undefined>(undefined);

  //? Aqui vemos que esta variable contendrá a la promesa 
  public connectionIdShare$ = this.connectionIdSubject.asObservable();
  connectionId: string | undefined;

  
  constructor(private router:Router) { 
    this.startConnection()
  }

  

  public startConnection =()=>{
    this.connection = new HubConnectionBuilder()
    .withUrl("https://localhost:7119/chatHub")
    .withAutomaticReconnect()
    .build();

    this.connection.start()
      .then(() => {
        console.log('Conexión establecida');
        console.log('ConnectionId:', this.connection?.connectionId);
        this.connectionId = this.connection?.connectionId ?? '';
        this.connectionIdSubject.next(this.connectionId);
      })
      .catch(err => {
        // const errorMessage = JSON.parse(err);
        // console.log("Error de conexion: ", errorMessage)
        console.log("Error de conexion: ", err)
        // if(err.statusCode == 401){
        //   this.router.navigate(['/login']);
        // }
      });

    
    this.connection.on("ReceiveMessage", (user:string, message:string, userId:number, connectionId:string)=>{
      this.messageReceived.next({user, message, userId, connectionId});
    })

    this.connection?.on("UserConnected", (conections:any)=>{
      this.userConnected.next(conections);
    })

    this.connection?.on("UserDisconnected", (disconections:any)=>{
      this.userDisconnected.next(disconections);
    })

  }

  public sendMessage = (message: string) => {
    if (this.connection) {
      this.connection.invoke('SendMessageToAll', message)
        .catch(err => console.error(err));
    } else {
      console.error('ChatHub connection is not established.');
    }
  }

  public isTyping =(isTyping:boolean)=>{
    if (this.connection) {
      this.connection?.invoke("isTyping", isTyping)
      .catch(err => console.error(err));
      } else {
        console.error('ChatHub connection is not established.');
    }
  }

  public getConnectionId(): string | undefined {
    return this.connectionId;
  }
  
}
