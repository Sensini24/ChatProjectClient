import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { Observable, Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ApiResponse, manyApiResponse, User } from '../../interfaces/IUser';
import { InitialsPipe } from '../../pipes/initials.pipe';

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
  userId:number = 0
  user:User | undefined

  username:string = "";
  contactsAll:User[] = [];
 

  childIdContact:number = 0
  childIdUserCurrent:number = 0

  constructor(private userService: UserService,private authService:AuthService){
  }

  ngOnInit(): void {
    const userIdService = this.authService.getUser();
    this.userId = parseInt(userIdService?.id ?? '0');


    this.userSubscription = this.userService.ObtenerUser(this.userId).subscribe((data:ApiResponse)=>{
      this.user = {
        userId : data.userdto.userId,
        username : data.userdto.username,
        email : data.userdto.email,
        gender : this.obtenerGenero(Number(data.userdto.gender))
      }
      // console.log("Usuario obtenido: ", data)
      // console.log("Usuario nuevo: ", this.user)

      this.username = this.user?.username ?? ""
      console.log("nombre para perfil: ", this.username)


    })

    this.usersSubscription = this.userService.GetAllUsers().subscribe((data:manyApiResponse)=>{
      console.log("Todos los usuario actuales: ", data.userdto);
      for (const user of data.userdto) {
        this.contactsAll?.push(user);
      }
    
      // Agregar todos los usuarios correctamente usando spread operator o concat
      // this.contactsAll.push(...data.userdto);

        // console.log("Todos los usuario actuales2 : ", this.contactsAll);
    })
        
    // this.getInitials()
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
    console.log("Id contact: ", this.childIdContact, "Id user current: ", this.childIdUserCurrent)
  }
  
}
