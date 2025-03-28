import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
// import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  // private hubConnection:signalR.HubConnection | undefined;
  private connection : HubConnection | undefined;
  public messageReceived = new Subject<{user:string, message:string}>();

  constructor() { 
    this.startConnection()
  }


  public startConnection =()=>{
    this.connection = new HubConnectionBuilder()
    .withUrl("http://localhost:5021/chatHub")
    .withAutomaticReconnect()
    .build();

    this.connection.start()
      .then(() => console.log('Connection started'))
      .catch(err => console.error('Error while starting connection: ' + err));

    
    this.connection.on("ReceiveMessage", (user:string, message:string)=>{
      this.messageReceived.next({user, message});
    })
  }

  public sendMessage = (message: string) => {
    if (this.connection) {
      this.connection.invoke('SendMessageToAll', message)
        .catch(err => console.error(err));
    } else {
      console.error('Hub connection is not established.');
    }
  }
  
}
