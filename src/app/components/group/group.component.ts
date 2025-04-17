import { Component, input, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { GroupService } from '../../services/group.service';
import { CommonModule } from '@angular/common';
import { SignalGroupService } from '../../signalsService/signal-group.service';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { ApiResponse, User } from '../../interfaces/IUser';
import { GroupMessagesGetDTO } from '../../interfaces/IGroup';

@Component({
  selector: 'app-group',
  imports: [CommonModule],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css'
})
export class GroupComponent implements OnInit, OnChanges, OnDestroy {
  @Input() groupId: number = 0;
  @Input() nameGroup: string = "";

  messagesGroup: any[] = []
  userCurrent: User | undefined
  userIdCurrent: number = 0
  messagesGroupMap: Map<number, any> = new Map<number, any>()
  messagesGroupArray:any[]  = [];

  private receiveGroupMessageSubscription: Subscription | undefined;
  private userCurrentSubscription: Subscription | undefined;
  private sendMessageGroupSubscription: Subscription | undefined;

  constructor(private groupService: GroupService, private signalGroupService: SignalGroupService, private userService: UserService) {
    this.userCurrentSubscription = this.userService.$userCurrent.subscribe((data: ApiResponse | null) => {
      if (data) {
        this.userCurrent = data.userdto
        this.userIdCurrent = data.userdto.userId
        console.log("USUARIO ACTUAL EN GRTUPOS: ", this.userCurrent)
      }
    });
    this.messagesGroup = []
    this.receiveGroupMessageSubscription = this.signalGroupService.messageReceived$.subscribe((data: any) => {
      console.log("Mensaje de Grupo recibido: ", data)

      if(data) {
        if(!this.messagesGroupMap.has(data.groupId)){
          this.messagesGroupMap.set(data.groupId, [])
        }
        this.messagesGroupMap.get(data.groupId).push(
          {
            groupName:data.groupName,
            groupId:data.groupId,
            user: data.user,
            userId: data.userId,
            message: data.message,
          }
        )
        /**
         *! ESTA VALIDACION SOLO SIRVE PARA ARRAY MOMENTANEO PARA EVITAR LA CARGA DE MENSAJES EN OTROS GRUPOS.
         *! COMO EL ID DEL GRUPO QUE SE USA PARA OBTENER MENSAJES DEL MAP VIENE DEL QUIEN ENVIA EL MSG, ENTONCES AL PASARLO AL MAP, SI NO SE VALIDA PARA VER SI EL ID DEL GRUPO ACTUAL ES EL MISMO QUE EL QUE SE ENVIO EN MENSAJE Y SE USA PARA BUSCAR EN MAP, ENTONCES SE CARGARA CUALQUIER GRUPO CON LOS DATOS DEL ARRAY OBTENIDO.
         */
        if(this.groupId == data.groupId){
          this.messagesGroupArray = this.messagesGroupMap.get(data.groupId)
        }
        // 

        console.log("MAP PARA GUARDAD MENSAJES DE GRUPO: ", this.messagesGroupMap)
        console.log("MENSAJES DE GRUPO OBTENIDOS DESDE MAP: ", this.messagesGroupArray)
      }

    })


  }

  ngOnInit(): void {

  }

  ngOnChanges(): void {
    this.messagesGroupArray = []
    if (this.nameGroup && this.groupId) {
      this.signalGroupService.JoinChatGroup(this.nameGroup);
      console.log("Nombre de grupo: ", this.nameGroup)
      // this.messagesGroupArray = this.messagesGroupMap.get(this.groupId)

      this.groupService.loadMessagesGroup(this.groupId).subscribe((data:any)=>{

        if(this.messagesGroupMap.has(this.groupId)){
          this.messagesGroupArray = data
        }else{
          this.messagesGroupMap.set(this.groupId, data)
          this.messagesGroupArray = this.messagesGroupMap.get(this.groupId)
        }
        console.log("DATOS DESDE SERVIDOR O CACHE: ", data)

      })
    }
  }



  /**
   * Según la lógica de un chat grupal no es necesario validar si un "contacto" en particular está activo.
   * Al ser el mismo que lo envía, parte del chat, se puede asumir que ese chat tiene un integrante("contacto") activo.
   * De modo que solo crearía el método de envío de mensaje a signal, esperar su devolución y sumarlo al array de grupo.
   * También agregaría el método para guardarlo en la base de datos y agregarlo al map de caché de service.
   */
  sendGroupMessage(inputValue: HTMLInputElement) {
    console.log("ELEMENTO ESCRITO: ", inputValue.value)
    const menssageeInput = inputValue.value;
    if (this.userCurrent) {
      if(menssageeInput == null || menssageeInput == ""){
        alert("Envíe un mensaje válido")
        return
      }
      this.signalGroupService.SendMessageToGroup(this.nameGroup,this.groupId, this.userCurrent.username, menssageeInput);
      inputValue.value = ""

      const messageToSave = {
        userId : this.userCurrent.userId,
        groupId : this.groupId,
        messageText : menssageeInput
      }
      this.sendMessageGroupSubscription = this.groupService.SaveMessageGroup(messageToSave).subscribe((data:GroupMessagesGetDTO)=>{
        console.log("Mensaje guardado correctamente: ", data)
      })

      this.groupService.addMessageGroupToCache(this.groupId, messageToSave)
      
    } else {
      console.error("Username is undefined. Cannot send message.");
    }
  }


  ngOnDestroy(): void {
    if (this.userCurrentSubscription) this.userCurrentSubscription.unsubscribe()
    if (this.receiveGroupMessageSubscription) this.receiveGroupMessageSubscription.unsubscribe()

  }
}
