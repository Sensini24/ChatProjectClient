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
import { GroupService } from '../../services/group.service';
import { ApiGroupResponse, ApiGroupSimpleResponse, GroupAddDTO, GroupGetDTO, GroupGetSimpleDTO, GroupParticipantsAddDTO, GroupParticipantsGetDTO, GroupSearchedGetDTO } from '../../interfaces/IGroup';
import { GroupComponent } from '../group/group.component';

@Component({
  selector: 'app-contacts',
  imports: [ChatComponent, InitialsPipe, CommonModule, GroupComponent],
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
  private createGroupSubscription : Subscription | undefined;
  private getGroupsByUserSubscription: Subscription | undefined;
  private getGroupsSubscription: Subscription | undefined;
  private addGroupParticipantSubscription: Subscription | undefined;
  user:User | undefined

  
  username:string = "";
  contactsAll:User[] = [];
  contactsForUser:Contact[] = [];
  usersFind:any[] = []
  groupsForUser:GroupGetSimpleDTO[] = []
 

  childIdContact:number = 0
  childIdUserCurrent:number = 0
  contactCurrentName:string = ""

  

// CHAT PRIVADO
  isShowPrivateChatComponent:boolean = false
  isShowPresentationChat:boolean = true
  isShowMessagesContact:boolean = false
  isFocus:boolean = false
  isShowOptionsContacts:boolean=false
  wasClickedOptions:boolean = false
  isContactSaved:boolean = false
  
  arrayIds: string[] = []
  nameChat:string = ""
  

  // CHAT GRUPALES
  isShowGroupComponent:boolean = true
  groupParticipantsArray:any = []

  user$: Observable<ApiResponse> | undefined;
  constructor(private userService: UserService,private contactsService:ContactService, private groupService:GroupService){
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
      // console.log("Todos los usuario actuales: ", data?.userdto);
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
        // console.log("CONTACTOS OBTENIDOS: ", contacts)
      }
    })

    this.getGroupsByUserSubscription = this.groupService.getGroupsByUser$.subscribe(groups=>{
      if(groups){
        this.groupsForUser = groups
        
        // this.groupParticipantsArray = groups.groupParticipants
        // console.log("API DATA GROUP COMPLETA: ", groups);
        console.log("Array para grupos de usuario: ", this.groupsForUser);
      }else{
        console.log("No se puedo obtener los grupos")
      }
      
    })
        
  }

  obtenerGenero(numero:number):string{
    const generos = ["Masculino", "Femenino", "Otros"]
    return generos[numero] ?? "Desconocido"
  }

  contactsFiltered:any = []
  yaestaencontactos:boolean= false
  searchNewContacts(event:Event){
    // console.log("tipeando: ", (event.target as HTMLInputElement).value)

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
      

        //? PASAR EL ARRYA CON EL USUARIO ENCONTRADO POR COINCIDENCIA DE INICIALES.
        this.usersFind = withoutSelfUser.map(user=>{
          var yaEsContacto = this.contactsForUser.some(x=>x.contactUserId == user.userId)
          return {...user, yaEstaEnContactos: yaEsContacto}
        })
        
        // console.log("USUARIO FILTRADOS: ",  this.contactsFiltered)
      } else {
        this.contactsFiltered = [];
        console.log("No se encontraron usuarios.");
      }
    });
  }

  contact:ContactAddDTO | undefined
  addNewContact(idContact:number, username:string){
    // console.log("DATOS OBTENIDOS PARA GUARADR CONTACTO: ", idContact,username)
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
        alert(`El usuario ${data.contactaddto.nickName} ha sido agregado como contacto`)
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

    this.isShowGroupComponent = true;
    this.isShowPrivateChatComponent = false
    this.nameChat = this.getChatName()
  }



  moreOptionsContacts(nickName: string){
    this.isShowOptionsContacts = !this.isShowOptionsContacts
    // console.log("Nombre de contacto clicado: ", nickName, this.wasClickedOptions)
  }
 


  getChatName():string{
    this.arrayIds = [this.childIdContact.toString(), this.childIdUserCurrent.toString()]
    this.nameChat = this.arrayIds.sort().join("-")

    return this.nameChat
  }


  isShowCreateGroup:boolean=false
  isShowModalCreateGroup:boolean = false
  //! CODIFICACION DE GRUPOS
  showItemsSideGroup(){
    this.isShowCreateGroup = !this.isShowCreateGroup
  }
  modalCreateGroup(){
    
    this.isShowModalCreateGroup = true
    console.log(this.isShowModalCreateGroup)
  }

  cancelCreationGroup(){
    this.isShowModalCreateGroup = false
    console.log(this.isShowModalCreateGroup)
  }

  group:GroupAddDTO | undefined;
  groupParticipants : GroupParticipantsAddDTO[] | undefined
  createNewGroup(inputNameGroup:HTMLInputElement){
    // console.log("valor de input para grupo: ", inputNameGroup.value)
    if(inputNameGroup.value == "" || inputNameGroup.value == null){
      alert("Ingrese un nombre para el grupo")
      return
    }
    this.groupParticipants = [{
      userId: this.user?.userId ?? 0
    }];


    this.group = {
      nameGroup : inputNameGroup.value,
      groupCategory : "Literatura",
      groupParticipants : this.groupParticipants
    }
    this.createGroupSubscription = this.groupService.CreateGroup(this.group).subscribe((data: ApiGroupResponse) => {
      if(data.success == true){
        this.isShowModalCreateGroup = false
        // console.log("Datos recibidos posterior a cracion de grupo: ", data.group)
        alert("Grupo creado correctamente")
        this.groupService.GetGroupsByUser()
      }
      
    })
  }

  groupId:number = 0;
  nameGroup:string = ""
  createGroupSaloon(groupId:number, nameGroup:string){
    console.log("DATOS DE GRUPO OBTENIDO AL CLICAR: ", groupId, nameGroup)
    this.isShowGroupComponent = false
    this.isShowPrivateChatComponent = true
    this.groupId = groupId;
    this.nameGroup = nameGroup;
    const elementos = this.groupsForUser.filter(x=>x.groupId == this.groupId)
    elementos.forEach(elem=>{
      this.groupParticipantsArray = elem.groupParticipants
      console.log("INTEGRANTES DE GRUPO ACTUAL: ", this.groupParticipantsArray)
    })
    
  }

  groupsFiltered:any = []
  isSuscripted:boolean = false
  isShowGroupsSearched:boolean = false
  searchNewGroups(event:Event){
    let groupSearched = (event.target as HTMLInputElement).value
    console.log("Grupo buscado: ",groupSearched)
    

    let change = groupSearched == "" || null ? this.isShowGroupsSearched = false : this.isShowGroupsSearched = true
    this.getGroupsSubscription = this.groupService.FindGroups(groupSearched).subscribe((data: GroupSearchedGetDTO[] | null) => {
      if (data) {
        let idsSinrepeticion = new Set(this.groupsForUser.map(x=>x.groupId))

        this.groupsFiltered = data.map(x=>{
          if(idsSinrepeticion.has(x.groupId)){
            this.isSuscripted = true
          }else{
            this.isSuscripted = false
          }

          return {...x, isSubscript:this.isSuscripted}
        })
        console.log("dATA:", data, "GROUPS FOR USER: ", this.groupsForUser, "GRUPO FILTRADO: ", this.groupsFiltered, idsSinrepeticion);
      } else {
        console.log("No se obtuvo los grupos.");
      }
    });
  }

  addNewGroup(groupId:number){
    if(groupId && this.user?.userId){
      const newParticipant = {
        userId: this.user.userId,
        groupId: groupId,
        invitationStatus: "Direct"
      }

      this.addGroupParticipantSubscription =  this.groupService.JoinGroup(newParticipant).subscribe((data:GroupParticipantsGetDTO)=>{
        console.log("Datos de partincipante unido: ", data)
        alert("Te uniste al grupo exitosamente")
        this.groupService.GetGroupsByUser()
      })
    }else{
      alert("No se le pudo agregar al grupo.")
    }
  }

  


  ngOnDestroy(): void {
    if (this.userSubscription) this.userSubscription.unsubscribe();
    if (this.messageSubscription) this.messageSubscription.unsubscribe();
    if (this.userfindSubscription) this.userfindSubscription.unsubscribe();
    if (this.createGroupSubscription) this.createGroupSubscription.unsubscribe();
    if (this.getGroupsByUserSubscription) this.getGroupsByUserSubscription.unsubscribe();
    if (this.getGroupsSubscription) this.getGroupsSubscription.unsubscribe();
    if (this.addGroupParticipantSubscription) this.addGroupParticipantSubscription.unsubscribe();
  }
}
