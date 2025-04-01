import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { SignalMessageService } from '../../signalsService/signal-message.service';
import { Chat, Message } from '../../interfaces/IChat';

@Component({
  selector: 'app-chat',
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  @Input() childIdContact: number = 0;
  @Input() childIdUserCurrent:number = 0

  private chatsSuscription: Subscription | undefined;
  datos:string = "";
  isTyping:boolean = true;
  //! VERSION SERVICE
  user:string = "Brandon"
  message:string = "";

  // newMessage: {user:string, message:string}
  messages: { user: string; message: string, userId:number, connectionId:string }[] = [];
  usersConnected:{connectionId:number}[]=[];
  // userNameLS: string = localStorage.getItem("iduser") || '';
  connectionId: string ="";


  userCurrentTipying:string = "";
  userIdCurrent:string = ""
  nameChat:string = ""

  private messageSubscription: Subscription | undefined;
  


  constructor(private messageService:MessageService, private signalMessageService: SignalMessageService){
    this.messageSubscription = signalMessageService.messageReceived.subscribe((message)=>{
      if(message){
        console.log("perro:", message.message, message.user, message.userId, message.connectionId)
        this.messages.push(message)
        // localStorage.setItem("iduser", message.user)
      }
    })

    
    
    this.signalMessageService.connectionIdShare$.subscribe((connId)=>{
      if (connId) {
        console.log("Connection Id actualizado: ", connId);
        this.connectionId = connId;

        // Aquí puedes ejecutar la lógica que dependa del connectionId
      }
    });
  }
  
  
  ngOnInit(){
    usersConnected:[]=[]

    this.messageSubscription = this.signalMessageService.userConnected.subscribe((connections: any)=>{
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

    this.messageSubscription = this.signalMessageService.userDisconnected.subscribe((disconections:any)=>{
      console.log("Usuario desconectado: ", disconections)
    })

  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }

    if (this.chatsSuscription) {
      this.chatsSuscription.unsubscribe();
    }
  }
  
  
  // chat:Chat = {
  //   NameChat: "",
    
  // }
  arrayIds: string[] = []
  
  sendMessageInput(inputelement:HTMLInputElement){

    //Envio de mensajes en chat en tiempo real
    this.message = inputelement.value;
    this.signalMessageService.sendMessage(this.message)
    inputelement.value = ""
    this.isTyping = true
    
    //Creacion de chat, guardado de participantes y guardado de mensaje en base de datos.
    this.arrayIds = [this.childIdContact.toString(), this.childIdUserCurrent.toString()]
    this.nameChat = this.arrayIds.sort().join("-")

    const messagesChat: { UserId: number; MessageText: string }[] = [];
    const chatParticipants : {UserId:number}[] = []
    messagesChat.push({UserId:this.childIdContact, MessageText:this.message})
    chatParticipants.push({UserId:this.childIdContact})
    chatParticipants.push({UserId:this.childIdUserCurrent})
    const chat: Chat = {
      NameChat: this.nameChat,
      Messages : messagesChat,
      ChatParticipants: chatParticipants
    }
    console.log("Id contact: ", this.childIdContact, "Id user current: ", this.childIdUserCurrent)
    console.log("Chat completo: ", chat)

    this.chatsSuscription =  this.messageService.SendMessage(chat).subscribe((data:any)=>{
      console.log("Mensaje de guardado de chats y mensajes: ", data)
    });
  }


  showTyping(event:Event){
    console.log("tipeando: ", (event.target as HTMLInputElement).value)

    const change = (event.target as HTMLInputElement).value !== "" ? this.isTyping = false : this.isTyping = true

    // this.isTyping = false
    console.log("this.isTyping: ", this.isTyping)
  }

  
}
