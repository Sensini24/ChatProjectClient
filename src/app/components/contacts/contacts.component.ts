import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { catchError, map, Observable, of, Subscription } from 'rxjs';
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

  user$: Observable<ApiResponse> | undefined;
  constructor(private userService: UserService,private authService:AuthService, private messageService:MessageService){
  }

  ngOnInit(): void {
    this.userSubscription = this.userService.$userCurrent.subscribe((data: ApiResponse | null) => {
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

    // this.user$ = this.userService.ObtenerUsuarioActual()

    this.usersSubscription = this.userService.$users.subscribe((data:manyApiResponse | null)=>{
      console.log("Todos los usuario actuales: ", data?.userdto);
      if(data?.userdto){
        for (const user of data.userdto) {
          this.contactsAll?.push(user);
        }
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
    // console.log("Id contact: ", this.childIdContact, "Id user current: ",this.childIdUserCurrent, "Username: ", this.childUserNameCurrent, "IsShow meesage: ", this.isShowMessagesContact, "IsShowPresentation: ", this.isShowPresentationChat)

  }


  getChatName():string{
    this.arrayIds = [this.childIdContact.toString(), this.childIdUserCurrent.toString()]
    this.nameChat = this.arrayIds.sort().join("-")

    return this.nameChat
  }
}
