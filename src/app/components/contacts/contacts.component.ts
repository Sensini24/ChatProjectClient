import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { Observable, Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ApiResponse, manyApiResponse, User } from '../../interfaces/IUser';
import { InitialsPipe } from '../../pipes/initials.pipe';
import { MessageService } from '../../services/message.service';
import { ApiResponseChat } from '../../interfaces/IChat';

@Component({
  selector: 'app-contacts',
  imports: [ChatComponent, InitialsPipe],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.css'
})
export class ContactsComponent implements OnInit, OnDestroy {

  
  // user$ = this.userService.$user
  private userSubscription: Subscription | undefined;
  private usersSubscription : Subscription | undefined

  private messageSubscription: Subscription | undefined;
  private receivePrivateChats : Subscription | undefined;
  
  userId:number = 0
  user:User | undefined

  username:string = "";
  contactsAll:User[] = [];
 

  childIdContact:number = 0
  childIdUserCurrent:number = 0
  childUserNameCurrent:string = ""


  isShowPresentationChat:boolean = true
  isShowMessagesContact:boolean = false


  arrayIds: string[] = []
  nameChat:string = ""

  constructor(private userService: UserService,private authService:AuthService, private messageService:MessageService){
  }

  ngOnInit(): void {
    const userIdService = this.authService.getUser();
    this.userId = parseInt(userIdService?.id ?? '0');
    this.userService.ObtenerUser().subscribe()

    this.userSubscription = this.userService.$user.subscribe((data: ApiResponse | null) => {
      if (data) {
        // console.log("Usuario obtenido: ", data)
        // console.log("Usuario nuevo: ", this.user)
        this.user = data.userdto
        this.username = this.user?.username ?? "";
        console.log("nombre para perfil: ", this.username);
      } else {
        console.log("No user data available");
      }
    });

    this.usersSubscription = this.userService.GetAllUsers().subscribe((data:manyApiResponse)=>{
      console.log("Todos los usuario actuales: ", data.userdto);
      for (const user of data.userdto) {
        this.contactsAll?.push(user);
      }
    
      // Agregar todos los usuarios correctamente usando spread operator o concat
      // this.contactsAll.push(...data.userdto);

        // console.log("Todos los usuario actuales2 : ", this.contactsAll);
    })
        
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  

  obtenerGenero(numero:number):string{
    const generos = ["Masculino", "Femenino", "Otros"]
    return generos[numero] ?? "Desconocido"
  }

  traerInfoUser(){
    console.log("USUARIO GUARADDO: ", this.user)
  }

  createChat(contactId:number){
    this.childIdContact = contactId;
    this.childIdUserCurrent = this.user?.userId ?? 0
    this.childUserNameCurrent = this.user?.username || ""

    this.isShowMessagesContact = true;
    this.isShowPresentationChat = false;
    
    // this.arrayIds = [this.childIdContact.toString(), this.childIdUserCurrent.toString()]
    // this.nameChat = this.arrayIds.sort().join("-")

    // this.mes
    console.log("Id contact: ", this.childIdContact, "Id user current: ",this.childIdUserCurrent, "Username: ", this.childUserNameCurrent, "IsShow meesage: ", this.isShowMessagesContact, "IsShowPresentation: ", this.isShowPresentationChat)


    this.receivePrivateChats = this.messageService.GetPrivateChat(this.getChatName(), 10).subscribe((data:ApiResponseChat)=>{
      console.log(`Chats de chats privado ${this.getChatName} obtenidos: `, data)
    })
  }


  getChatName():string{
    this.arrayIds = [this.childIdContact.toString(), this.childIdUserCurrent.toString()]
    this.nameChat = this.arrayIds.sort().join("-")

    return this.nameChat
  }
}
