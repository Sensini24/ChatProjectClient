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
  messages: { user: string; message: string }[] = [];

  private messageSubscription: Subscription | undefined;
  private connection : HubConnection | undefined;
  constructor(private messageService:MessageService){

    
    // this.connection = new HubConnectionBuilder().
    //                   withUrl("http://localhost:5021/chatHub").
    //                   build();


    // this.connection.on("ReceiveMessage", (user:string, message:string)=> this.recibirMensajes({user, message}))

    this.messageSubscription = messageService.messageReceived.subscribe((message)=>{
      if(message){
        console.log("perro:", message.message, message.user)
        this.messages.push(message)
      }
    })

    
    
  }
  ngOnInit(){
    // this.connection?.start()
    //   .then(_ => {
    //     console.log('Connection Started');
    //   }).catch(error => {
    //     return console.error(error);
    //   });

    
  }

  datos:string = "";
  valorInput(event:Event){
    const input = event.target as HTMLInputElement;
    this.datos = input.value;
  }

  // recibirMensajes(message:{user:string, message:string}){
  //   this.messages.push(message)
  // }

  
  // user:string = "Brandon"
  // message:string = "";
  

  // dato(){
  //   this.message = this.datos;
  //   console.log("hola: ", this.message);
  //   this.connection?.invoke('SendMessageToAll', this.user, this.message)
  //     .then(_=>console.log("Mensaje enviado: ", this.user, this.message))
    
  // }


  //! VERSION SERVICE
  user:string = "Brandon"
  message:string = "";
  dato(){
    this.message = this.datos
    this.messageService.sendMessage(this.message)
    // this.messageService.sendMessage("Brandon",this.message)
    
  }

  
}
