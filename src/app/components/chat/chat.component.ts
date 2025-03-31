import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Component({
  selector: 'app-chat',
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {

  

  // newMessage: {user:string, message:string}
  messages: { user: string; message: string, userId:number, connectionId:string }[] = [];
  usersConnected:{connectionId:number}[]=[];
  // userNameLS: string = localStorage.getItem("iduser") || '';
  connectionId: string ="";


  userCurrentTipying:string = "";
  userIdCurrent:string = ""

  private messageSubscription: Subscription | undefined;
  


  constructor(private messageService:MessageService){
    this.messageSubscription = messageService.messageReceived.subscribe((message)=>{
      if(message){
        console.log("perro:", message.message, message.user, message.userId, message.connectionId)
        this.messages.push(message)
        // localStorage.setItem("iduser", message.user)
      }
    })

    
    
    this.messageService.connectionIdShare$.subscribe((connId)=>{
      if (connId) {
        console.log("Connection Id actualizado: ", connId);
        this.connectionId = connId;

        // Aquí puedes ejecutar la lógica que dependa del connectionId
      }
    });
  }
  
  
  ngOnInit(){
    usersConnected:[]=[]

    this.messageSubscription = this.messageService.userConnected.subscribe((connections: any)=>{
      if(connections){
        // console.log(`El usuario con la coneccion ${connections} acaba de conectarse`)
        
        for (const userId in connections) {
          if(userId !== "0" ){
            const userInfoList: string[] = connections[userId];
            const connection = userInfoList[0];
            const username = userInfoList[1];
            console.log(`El usuario con ID ${userId}, conexión ${connection} y nombre ${username} acaba de conectarse`);
            // Podrías querer almacenar esta información en tu componente Angular

            if(connection == this.connectionId){
              this.userCurrentTipying = username;
              this.userIdCurrent = userId
            }
          }
        }
        for (const userId in connections) {
          const userInfoList: string[] = connections;
          console.log("Usuarios CONECTADOS: ", userInfoList)
        }

        
      }
    })

    this.messageSubscription = this.messageService.userDisconnected.subscribe((disconections:any)=>{
      console.log("Usuario desconectado: ", disconections)
    })

    
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
  datos:string = "";
  isTyping:boolean = true;
  //! VERSION SERVICE
  user:string = "Brandon"
  message:string = "";
  sendMessageInput(inputelement:HTMLInputElement){
    // this.message = this.datos
    this.message = inputelement.value;
    this.messageService.sendMessage(this.message)
    inputelement.value = ""
    this.isTyping = true
  }


  showTyping(event:Event){
    console.log("tipeando: ", (event.target as HTMLInputElement).value)

    const change = (event.target as HTMLInputElement).value !== "" ? this.isTyping = false : this.isTyping = true

    // this.isTyping = false
    console.log("this.isTyping: ", this.isTyping)
  }

  
}
