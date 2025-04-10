import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { catchError, map, Observable, of, Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ApiResponse, ApiResponseDTO, manyApiResponse, User, UserDTO } from '../../interfaces/IUser';
import { InitialsPipe } from '../../pipes/initials.pipe';
import { MessageService } from '../../services/message.service';
import { ApiResponseChat } from '../../interfaces/IChat';
import { ContactService } from '../../services/contact.service';
import { ApiResponseAddContact, Contact, ContactAddDTO } from '../../interfaces/IContact';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contacts',
  imports: [ChatComponent, InitialsPipe, CommonModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.css'
})
export class ContactsComponent implements OnInit, OnDestroy {

  
  // user$ = this.userService.$user
  private userSubscription: Subscription | undefined;
  private usersSubscription : Subscription | undefined

  private contactsSubscription : Subscription | undefined;

  private messageSubscription: Subscription | undefined;
  private userfindSubscription: Subscription | undefined;
  private addContactSubscription: Subscription | undefined;

  user:User | undefined

  
  username:string = "";
  contactsAll:User[] = [];
  contactsForUser:Contact[] = [];
  usersFind:User[] = []
 

  childIdContact:number = 0
  childIdUserCurrent:number = 0
  contactCurrentName:string = ""


  isShowPresentationChat:boolean = true
  isShowMessagesContact:boolean = false
  isFocus:boolean = false
  isShowOptionsContacts:boolean=false
  wasClickedOptions:boolean = false
  isContactSaved:boolean = false
  
  arrayIds: string[] = []
  nameChat:string = ""


  user$: Observable<ApiResponse> | undefined;
  constructor(private userService: UserService,private contactsService:ContactService, private messageService:MessageService){
  }

  ngOnInit(): void {
    this.userSubscription = this.userService.$userCurrent.subscribe((data: ApiResponse | null) => {
      if (data) {
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

    this.contactsSubscription = this.contactsService.contacts$.subscribe(contacts=>{
      if(contacts){
        this.contactsForUser = contacts
        console.log("CONTACTOS OBTENIDOS: ", contacts)
      }
    })
        
  }

  

  

  

  obtenerGenero(numero:number):string{
    const generos = ["Masculino", "Femenino", "Otros"]
    return generos[numero] ?? "Desconocido"
  }

  yaestaencontactos:boolean= false
  searchNewContacts(event:Event){
    console.log("tipeando: ", (event.target as HTMLInputElement).value)

    var tosearch = (event.target as HTMLInputElement).value
    if (tosearch.length == 0){
      this.usersFind = []
    }
    
    this.userfindSubscription = this.userService.FindUsersForContacts(tosearch).subscribe((data: ApiResponseDTO | null) => {
      //? FILTRADO PARA ADJUDICAR BOTON DE AGREGAR CONTACTO SI NO ESTA ENTRE LOS CONTACTOS
      this.yaestaencontactos = false
      this.isContactSaved = false
      if (data?.userdto) {
        //? FILTRO PARA QUITAR AL USUARIO ACTUAL
        var withoutSelfUser = data.userdto.filter(u=>u.userId != this.user?.userId)
        console.log("USUARIO FILTRADOS: ", withoutSelfUser)

      
        withoutSelfUser.filter(x=>{
          this.contactsForUser.forEach(elem=>{
            if(x.userId == elem.contactUserId){
              this.yaestaencontactos = true
            }
          })
        })
        //? PASAR EL ARRYA CON EL USUARIO ENCONTRADO POR COINCIDENCIA DE INICIALES.
        this.usersFind = withoutSelfUser
        // console.log("comparacion: ", this.yaestaencontactos)
        // console.log("Usuarios encontrados: ", this.usersFind);
      } else {
        this.usersFind = [];
        console.log("No se encontraron usuarios.");
      }
    });
  }

  contact:ContactAddDTO | undefined
  addNewContact(idContact:number, username:string){
    console.log("DATOS OBTENIDOS PARA GUARADR CONTACTO: ", idContact,username)
    this.contact = {
      userId:this.user?.userId ?? 0,
      contactUserId:idContact,
      nickName:username
    }
    
    this.addContactSubscription = this.contactsService.AddContact(this.contact).subscribe((data:ApiResponseAddContact | undefined)=>{
      if(data?.success==true){
        this.isContactSaved = true
        this.contactsForUser = [...this.contactsForUser, data.contactaddto]

        this.contactsService.GetContacts();
      }
    })

  }
  traerInfoUser(){
    console.log("USUARIO GUARADDO: ", this.user)
  }

  
  createChat(contactId:number){
    this.childIdContact = contactId;
    this.childIdUserCurrent = this.user?.userId ?? 0
    var currentContact = this.contactsForUser.filter(x=>x.contactUserId == contactId)
    this.contactCurrentName = currentContact[0]?.nickName || ""
    // console.log("Current contact info: ", this.contactCurrentName)

    this.isShowMessagesContact = true;
    this.isShowPresentationChat = false;
    this.isFocus = true
    
    
    // this.arrayIds = [this.childIdContact.toString(), this.childIdUserCurrent.toString()]
    // this.nameChat = this.arrayIds.sort().join("-")

    // this.mes
    // console.log("Id contact: ", this.childIdContact, "Id user current: ",this.childIdUserCurrent, "Username: ", this.childUserNameCurrent, "IsShow meesage: ", this.isShowMessagesContact, "IsShowPresentation: ", this.isShowPresentationChat)

  }

  moreOptionsContacts(nickName: string){
    this.isShowOptionsContacts = !this.isShowOptionsContacts
    console.log("Nombre de contacto clicado: ", nickName, this.wasClickedOptions)
  }
 


  getChatName():string{
    this.arrayIds = [this.childIdContact.toString(), this.childIdUserCurrent.toString()]
    this.nameChat = this.arrayIds.sort().join("-")

    return this.nameChat
  }


  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }

    if (this.userfindSubscription) {
      this.userfindSubscription.unsubscribe();
    }

    
  }
}
