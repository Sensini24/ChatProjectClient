import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { SignalMessageService } from '../../signalsService/signal-message.service';
import { ApiResponseChat, Chat, Message } from '../../interfaces/IChat';
import { CommonModule, DatePipe } from '@angular/common';
import { UserService } from '../../services/user.service';
import { ApiResponse, User } from '../../interfaces/IUser';
import { DateShowPipe } from '../../pipes/dateshow.pipe';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, DateShowPipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  @Input() childIdContact: number = 0;
  @Input() childIdUserCurrent:number = 0
  @Input() nameChat:string = ""
  @Input() isShowMessagesContact:boolean = false
  @Input() isShowPresentationChat:boolean = true
  @Input() contactCurrentName:string = ""

  
  datos:string = "";
  isTyping:boolean = true;
  //! VERSION SERVICE
  message:string = "";
  user:User | undefined

  messages: { user: string; message: string, userId:number, connectionId:string, date:Date }[] = [];
  privateMessages :any[]  = [];
  usersConnected:[] = []
  privateMessageMap : Map<string,any> = new Map<string, any>()
  pruebaArrayMessagesMap :any[]  = [];
  
  connectionId: string ="";


  userCurrentTipying:string = "";
  userIdCurrent:number = 0
  username:string = ""
  contactName:string = ""
  id:number = 0;

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
        // console.log("Mensaje publicos:", message.message, message.user, message.userId, message.connectionId, message.date)
        this.messages.push(message)
        this.privateMessageMap.set(this.nameChat, message)
        // localStorage.setItem("iduser", message.user)
      }
    })

    //? OBTENER LOS MENSAJES PRIVADOR Y GUARDARLOS EN EL ARRAY
    this.signalprivateMessageSubscription = this.signalMessageService.privateMessageReceived.subscribe((data:any)=>{
      if (data) {
        // console.log("Mensajes privados: ", privateMessages.message, privateMessages.user, privateMessages.userId, privateMessages.connectionId, privateMessages.date);
        // console.log("MENSAJE RECIBIDO DE SIGNAL: ", data, this.privateMessages)
        // if (data.userId !== this.userIdCurrent) {
        if(this.pruebaArrayMessagesMap.length ==0){
          this.id = 1
        }else{
          this.id = this.pruebaArrayMessagesMap[this.pruebaArrayMessagesMap.length - 1 ].id + 1
        }
          
          this.privateMessageMap.get(data.chatName).push({ userId:data.userId, userName: data.user, messageText: data.message, connectionId:data.connectionId, messageDate:data.date })
          console.log("CHAT NAME: ", data.chatName)

      }
    })

    

      this.currentUserSubscription = this.userService.$userCurrent.subscribe((data: ApiResponse | null) => {
        if (data) {
          // console.log("Usuario obtenido: ", data)
          // console.log("Usuario nuevo: ", this.user)
          this.user = data.userdto
          this.username = this.user?.username ?? "";
          this.userIdCurrent  = this.user?.userId
          // console.log("nombre para perfil: ", this.username);
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

    // this.receivePrivateChats = this.messageService.$privateChat.subscribe((data: any | null) => {
    //   console.log(`Chats de chats privado ${this.getChatName()} obtenidos: `, data);
    //   const privateMessagesServer = data?.chatDto.messages
    //   this.privateMessages = []

    //     if (privateMessagesServer) {
    //       privateMessagesServer.forEach((element:any) => {
    //         this.privateMessages.push(element);
            
    //       });

    //       //? OBTENGO LOS MENSAJES DE SERVIDOR TRANSPORTADOS DESDE MESSAGE SERVICE Y LOS ALMACENO EN UN MAP PARA EVITAR CONFUSIONES.
    //       //? Almaceno la parte del array dentro de otr array para pasarselo a la interfaz y para que lo cargue.
    //       if(this.privateMessageMap.has(this.getChatName())){
            
    //         this.pruebaArrayMessagesMap = this.privateMessageMap.get(this.getChatName());
    //         console.log("Private messages en array prueba Map ya existe: ", this.pruebaArrayMessagesMap, this.privateMessageMap)
    //       }else{
    //         this.privateMessageMap.set(this.getChatName(), privateMessagesServer)
    //         this.pruebaArrayMessagesMap = this.privateMessageMap.get(this.getChatName())
    //         // this.contactName = data.chatDto.ChatParticipants
    //         console.log("Private messages en array prueba Map: ", this.pruebaArrayMessagesMap, this.privateMessageMap)
    //       }
          
    //     }
    // });
  }

  ngOnChanges(): void {
    //? EN CASO DE CAMBIO DE PARAMETROS PARA OBTENER EL CHAT CON UN NOMBRE DE CHAT
    this.privateMessages = []
    this.pruebaArrayMessagesMap = []
    // console.log("NOMBRE DE CHAT: ", this.nameChat)
    if (this.childIdContact && this.childIdUserCurrent) {
      const chatName = this.nameChat;
      this.messageService.loadPrivateChat(chatName, 150).subscribe((data: any | null) => {
        console.log(`Chats de chats privado ${this.nameChat} obtenidos: `, data);

        //! AQUI CUANDO NO TIENES MENSAJES, ENTONCES SE CREA EL MAP PERO CON ARRAY VACIO
        if(data.success == false){
          this.privateMessageMap.set(this.nameChat, [] )
          this.pruebaArrayMessagesMap = this.privateMessageMap.get(this.nameChat)
        }
        //! AQUI EN CASO DE QUE SI HAYA MENSAJES
        else{
          const privateMessagesServer = data?.chatDto.messages
  
          if (privateMessagesServer) {
            // privateMessagesServer.forEach((element:any) => {
            //   this.privateMessages.push(element);
              
            // });
  
            //? OBTENGO LOS MENSAJES DE SERVIDOR TRANSPORTADOS DESDE MESSAGE SERVICE Y LOS ALMACENO EN UN MAP PARA EVITAR CONFUSIONES.
            //? Almaceno la parte del array dentro de otr array para pasarselo a la interfaz y para que lo cargue.
            if(this.privateMessageMap.has(this.nameChat)){
              
              this.pruebaArrayMessagesMap = this.privateMessageMap.get(this.nameChat);
              console.log("Private messages en array prueba Map ya existe: ", this.pruebaArrayMessagesMap, this.privateMessageMap)
            }
            //? En caso de que existan los mensaje
            else{
              this.privateMessageMap.set(this.nameChat, privateMessagesServer)
              this.pruebaArrayMessagesMap = this.privateMessageMap.get(this.nameChat)
              // this.contactName = data.chatDto.ChatParticipants
              console.log("Private messages en array prueba Map: ", this.pruebaArrayMessagesMap, this.privateMessageMap)
            }
            
          }
        }
        
      });
      
    }

    if(this.contactCurrentName){
      this.contactName = this.contactCurrentName
      console.log("NOMBRE DE CONTACTO PASADO DE PADRE: ", this.contactName)
    }
  }

  
  
  
  arrayIds: string[] = []
  // messageCachéModel: { userId: number, userName:string, messageText:string,  } = { userId: 0 }
  
  sendMessageInput(inputelement:HTMLInputElement){

    //Envio de mensajes en chat en tiempo real
    this.message = inputelement.value;
    const connectionContact = this.usersConnected[this.childIdContact]?.[0]
    if(connectionContact != null || connectionContact !== undefined){
      this.signalMessageService.sendPrivateMessage(connectionContact, this.message, this.nameChat)
      console.log("Conexion de usuario y mensaje: ", connectionContact, this.message, this.nameChat)
    }
    else{
      
      if(this.pruebaArrayMessagesMap.length ==0){
        this.id = 1
      }else{
        this.id = this.pruebaArrayMessagesMap[this.pruebaArrayMessagesMap.length - 1 ].id + 1
      }
      console.log("Nuevo Id: ", this.id)
      this.pruebaArrayMessagesMap.push({ id:this.id, userId:this.childIdUserCurrent, userName: this.username, messageText: this.message,   connectionId:"", messageDate:new Date() })
      
      this.privateMessages.push({ id:this.id, userId:this.childIdUserCurrent, userName: this.username, messageText: this.message,   connectionId:"", messageDate:new Date()})
      console.log("nO HAY CONECCION CON EL CONTACTO, PERO SI SE ENVIAR MENSAJE AL ARRAY: ", this.pruebaArrayMessagesMap)
    }
    // this.signalMessageService.sendMessage(this.message)
    if(this.pruebaArrayMessagesMap.length ==0){
      this.id = 1
    }else{
      this.id = this.pruebaArrayMessagesMap[this.pruebaArrayMessagesMap.length - 1 ].id + 1
    }
    //   console.log("Nuevo Id: ", this.id)
    inputelement.value = ""
    this.isTyping = true

    console.log("Mensaje almacenado: ", this.pruebaArrayMessagesMap)

    //? Creacion de chat, guardado de participantes y guardado de mensaje en base de datos.
    this.savePrivateChatMessage(this.id)
  }
  

  savePrivateChatMessage(id: number){
    // this.arrayIds = [this.childIdContact.toString(), this.childIdUserCurrent.toString()]
    // this.nameChat = this.arrayIds.sort().join("-")

    const messagesChat: { UserId: number; MessageText: string }[] = [];
    const chatParticipants : {UserId:number}[] = []

    messagesChat.push({UserId:this.childIdUserCurrent, MessageText:this.message})
    chatParticipants.push({UserId:this.childIdContact})
    chatParticipants.push({UserId:this.childIdUserCurrent})

    const chat: Chat = {
      NameChat: this.nameChat,
      Messages : messagesChat,
      ChatParticipants: chatParticipants
    }
    console.log("Chat completo: ", chat)

    this.sendchatsSuscription =  this.messageService.SendMessage(chat).subscribe((data:any)=>{
      console.log("Mensaje de guardado de chats y mensajes: ", data)
    });

    //? Guardado de meesages en tiempo real denntro de cache.
    // this.messageCachéModel = { userId: this.childIdUserCurrent }
    
    // this.messageService.addMessageToCache(this.getChatName(), { id:id, messageText: this.message, userName: this.username, userId:this.childIdUserCurrent, connectionId:"", messageDate:new Date() });
    this.messageService.addMessageToCache(this.nameChat, { id: id, userId:this.user?.userId, userName: this.user?.username, messageText: this.message, connectionId:"", messageDate:new Date() });
    
  }

  
  showTyping(event:Event){
    // console.log("tipeando: ", (event.target as HTMLInputElement).value)

    const change = (event.target as HTMLInputElement).value !== "" ? this.isTyping = false : this.isTyping = true
    // console.log("this.isTyping: ", this.isTyping)
  }

  // getChatName():string{
  //   this.arrayIds = [this.childIdContact.toString(), this.childIdUserCurrent.toString()]
  //   this.nameChat = this.arrayIds.sort().join("-")

  //   return this.nameChat
  // }


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
}
