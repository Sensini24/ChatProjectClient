import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalGroupService {

  private connection : HubConnection | undefined;

  private messageReceivedSubject = new BehaviorSubject<any>(null)
  public messageReceived$ = this.messageReceivedSubject.asObservable()
    
  constructor() {
    this.startConnection()
  }

  public startConnection =()=>{
    this.connection = new HubConnectionBuilder()
    .withUrl("https://localhost:7119/groupHub")
    .withAutomaticReconnect()
    .build();

    this.connection.start()
      .then(() => {
        console.log('Conexión a grupos establecida');
      })
      .catch(err => {
        console.log("Error de conexion: ", err)
      });

    
    this.connection?.on("ReceiveGroupMessage", (user,userId, message)=>{
      this.messageReceivedSubject.next({user,userId, message});
    })
  }

  public JoinChatGroup=(groupName:string)=>{
    if(this.connection){
      this.connection?.invoke("JoinChatGroup", groupName)
      .catch(err => console.error(err))
    }else{
      console.log("La conexión a grupos no fue establecida")
    }
  }


  public SendMessageToGroup =(groupName:string, user:string, message:string)=>{
    if(this.connection){
      this.connection?.invoke("SendMessageToGroup", groupName, user, message)
      .catch(err => console.error(err))
    }else{
      console.log("La conexión a grupos no fue establecida")
    }
  }

}
