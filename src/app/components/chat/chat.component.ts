import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { SignalMessageService } from '../../signalsService/signal-message.service';
import { ApiResponseChat, Chat, Message } from '../../interfaces/IChat';
import { CommonModule } from '@angular/common';
import e from 'express';
import { UserService } from '../../services/user.service';
import { ApiResponse, User } from '../../interfaces/IUser';

@Component({
  selector: 'app-chat',
  imports: [CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  @Input() childIdContact: number = 0;
  @Input() childIdUserCurrent:number = 0
  @Input() isShowMessagesContact:boolean = false
  @Input() isShowPresentationChat:boolean = true
  @Input() childUserNameCurrent:string = ""

  
  datos:string = "";
  isTyping:boolean = true;
  //! VERSION SERVICE
  message:string = "";
  user:User | undefined

  // newMessage: {user:string, message:string}
  messages: { user: string; message: string, userId:number, connectionId:string, date:Date }[] = [];
  // privateMessages :{ message: string; user: string; userId:number, connectionId:string, date:Date }[]  = [];
  privateMessages :any[]  = [];
  usersConnected:[] = []
  
  // userNameLS: string = localStorage.getItem("iduser") || '';
  connectionId: string ="";


  userCurrentTipying:string = "";
  userIdCurrent:number = 0
  nameChat:string = ""
  username:string = ""
  contactName:string = ""

  private signalConnectionIdCurrentUser : Subscription | undefined
  private sendchatsSuscription: Subscription | undefined;
  private signalGlobalMessageSubscription: Subscription | undefined;
  private signalprivateMessageSubscription: Subscription | undefined;
  private signalUserConnectedSubscription : Subscription | undefined;
  private currentUserSubscription: Subscription | undefined;
  private signalUserDisconnectedSubscription: Subscription | undefined;
  private receivePrivateChats : Subscription | undefined;
  

  constructor(private messageService:MessageService, private userService:UserService, private signalMessageService: SignalMessageService){
    //?OBTENER LA CONEXION DEL USUARIO ACTUAL
    this.signalConnectionIdCurrentUser = this.signalMessageService.connectionIdShare$.subscribe((connId)=>{
      if (connId) {
        console.log("Connection Id actualizado: ", connId);
        this.connectionId = connId;
        // Aquí puedes ejecutar la lógica que dependa del connectionId
      }
    });

    //? OBTENER LOS MENSAJES GLOBALES Y GUARDARLOS EN EL ARRYA MESSAGES
    this.signalGlobalMessageSubscription = signalMessageService.messageReceived.subscribe((message)=>{
      if(message){
        console.log("Mensaje publicos:", message.message, message.user, message.userId, message.connectionId, message.date)
        this.messages.push(message)
        // localStorage.setItem("iduser", message.user)
      }
    })

    //? OBTENER LOS MENSAJES PRIVADOR Y GUARDARLOS EN EL ARRAY
    this.signalprivateMessageSubscription = this.signalMessageService.privateMessageReceived.subscribe((privateMessages:any)=>{
      if (privateMessages) {
        console.log("Mensajes privados: ", privateMessages.message, privateMessages.user, privateMessages.userId, privateMessages.connectionId, privateMessages.date);
        this.privateMessages.push(privateMessages);
        // Aquí puedes ejecutar la lógica que dependa del connectionId
      }
    })

      this.currentUserSubscription = this.userService.$userCurrent.subscribe((data: ApiResponse | null) => {
        if (data) {
          // console.log("Usuario obtenido: ", data)
          // console.log("Usuario nuevo: ", this.user)
          this.user = data.userdto
          this.username = this.user?.username ?? "";
          this.userIdCurrent  = this.user?.userId
          console.log("nombre para perfil: ", this.username);
        } else {
          console.log("No user data available");
        }
      });


      // this.receivePrivateChats = this.messageService.$privateChat.subscribe((data:ApiResponseChat)=>{
      //   console.log(`Chats de chats privado ${this.getChatName} obtenidos: `, data)
      // })

    
  }
  
  
  ngOnInit(){
    usersConnected:[]=[]
    
    this.signalUserConnectedSubscription = this.signalMessageService.userConnected.subscribe((connections: any)=>{
      if(connections){

        console.log("Usuario conectado: ", connections)


        //? ASIGNAMOS LOS CONECTADOS A UNA ARRAY PARA PODER OBTENER LOS USUARIOS MEDIANTE SU ID.
        this.usersConnected = connections
        console.log("Usuarios CONECTADOS: ", this.usersConnected)
      }
    })

    this.signalUserDisconnectedSubscription = this.signalMessageService.userDisconnected.subscribe((disconections:any)=>{
      console.log("Usuario desconectado: ", disconections)
    })

    //? SE SUSCRIBE ANTE CUALQUIER CAMBIO.

      this.receivePrivateChats = this.messageService.$privateChat.subscribe((data: any | null) => {
        console.log(`Chats de chats privado ${this.getChatName()} obtenidos: `, data);
        const privateMessagesServer = data?.chatDto.messages
        this.privateMessages = []

          if (privateMessagesServer) {
            privateMessagesServer.forEach((element:any) => {
              this.privateMessages.push(element);
            });
            // this.contactName = data.chatDto.ChatParticipants
            // console.log("Private messages en array: ", this.privateMessages)
          }
        
        
        // Aquí puedes procesar los datos de los mensajes (data)
      });
  }

  ngOnChanges(): void {
    //? EN CASO DE CAMBIO DE PARAMETROS PARA OBTENER EL CHAT CON UN NOMBRE DE CHAT
    if (this.childIdContact && this.childIdUserCurrent) {
      const chatName = this.getChatName();
      this.messageService.loadPrivateChat(chatName, 150);
    }
  }

  ngOnDestroy(): void {
    if (this.signalGlobalMessageSubscription) {
      this.signalGlobalMessageSubscription.unsubscribe();
    }

    if (this.sendchatsSuscription) {
      this.sendchatsSuscription.unsubscribe();
    }

    if (this.signalprivateMessageSubscription) {
      this.signalprivateMessageSubscription.unsubscribe();
    }

    if(this.currentUserSubscription){
      this.currentUserSubscription.unsubscribe()
    }

    if(this.signalConnectionIdCurrentUser){
      this.signalConnectionIdCurrentUser.unsubscribe()
    }

    if(this.signalUserConnectedSubscription){
      this.signalUserConnectedSubscription.unsubscribe()
    }

    if(this.signalUserDisconnectedSubscription){
      this.signalUserDisconnectedSubscription.unsubscribe()
    }

    if(this.receivePrivateChats){
      this.receivePrivateChats.unsubscribe()
    }
  }
  
  
  arrayIds: string[] = []
  // messageCachéModel: { userId: number, userName:string, messageText:string,  } = { userId: 0 }
  
  sendMessageInput(inputelement:HTMLInputElement){

    //Envio de mensajes en chat en tiempo real
    this.message = inputelement.value;
    const connectionContact = this.usersConnected[this.childIdContact]?.[0]
    if(connectionContact != null || connectionContact !== undefined){
      this.signalMessageService.sendPrivateMessage(connectionContact, this.message)
      console.log("Conexion de usuario y mensaje: ", connectionContact, this.message)
    }else{
      console.log("nO HAY CONECCION CON EL CONTACTO, PERO SI SE ENVIAR MENSAJE AL ARRAY")

      this.privateMessages.push({ messageText: this.message, userName
        : this.username, userId:this.childIdUserCurrent, connectionId:"", date:new Date() })
    }
    // this.signalMessageService.sendMessage(this.message)
    
    inputelement.value = ""
    this.isTyping = true
    
   
    // console.log("Id contact: ", this.childIdContact, "Id user current: ", this.childIdUserCurrent)
    // console.log("Usuario conectados para sabe su connectionid por su id: ", this.usersConnected[this.childIdUserCurrent])
    // console.log("Usuario contacto para sabe su connectionid por su id: ", this.usersConnected[this.childIdContact])
    console.log("Mensaje almacenado: ", this.privateMessages)

    //? Creacion de chat, guardado de participantes y guardado de mensaje en base de datos.
    this.savePrivateChatMessage()
  }


  savePrivateChatMessage(){
    // this.arrayIds = [this.childIdContact.toString(), this.childIdUserCurrent.toString()]
    // this.nameChat = this.arrayIds.sort().join("-")

    const messagesChat: { UserId: number; MessageText: string }[] = [];
    const chatParticipants : {UserId:number}[] = []

    messagesChat.push({UserId:this.childIdUserCurrent, MessageText:this.message})
    chatParticipants.push({UserId:this.childIdContact})
    chatParticipants.push({UserId:this.childIdUserCurrent})

    const chat: Chat = {
      NameChat: this.getChatName(),
      Messages : messagesChat,
      ChatParticipants: chatParticipants
    }
    console.log("Chat completo: ", chat)

    this.sendchatsSuscription =  this.messageService.SendMessage(chat).subscribe((data:any)=>{
      console.log("Mensaje de guardado de chats y mensajes: ", data)
    });

    //? Guardado de meesages en tiempo real denntro de cache.
    // this.messageCachéModel = { userId: this.childIdUserCurrent }
    
    this.messageService.addMessageToCache(this.getChatName(), { messageText: this.message, userName: this.username, userId:this.childIdUserCurrent, connectionId:"", date:new Date() });
  }

  
  showTyping(event:Event){
    console.log("tipeando: ", (event.target as HTMLInputElement).value)

    const change = (event.target as HTMLInputElement).value !== "" ? this.isTyping = false : this.isTyping = true
    // console.log("this.isTyping: ", this.isTyping)
  }

  getChatName():string{
    this.arrayIds = [this.childIdContact.toString(), this.childIdUserCurrent.toString()]
    this.nameChat = this.arrayIds.sort().join("-")

    return this.nameChat
  }
}
