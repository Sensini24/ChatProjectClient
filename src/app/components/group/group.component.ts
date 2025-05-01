import { Component, EventEmitter, input, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { GroupService } from '../../services/group.service';
import { CommonModule } from '@angular/common';
import { SignalGroupService } from '../../signalsService/signal-group.service';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { ApiResponse, User } from '../../interfaces/IUser';
import { GroupMessagesGetDTO } from '../../interfaces/IGroup';
import { DateShowPipe } from '../../pipes/dateshow.pipe';

@Component({
  selector: 'app-group',
  imports: [CommonModule, DateShowPipe],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css'
})
export class GroupComponent implements OnInit, OnChanges, OnDestroy {
  @Input() groupId: number = 0;
  @Input() nameGroup: string = "";
  @Input() groupParticipantsArray:any = []
  @Output() isShowSharesGroup= new EventEmitter<boolean>();

  isShowParticipant:boolean = false
  messagesGroup: any[] = []
  userCurrent: User | undefined
  userIdCurrent: number = 0
  messagesGroupMap: Map<number, any> = new Map<number, any>()
  messagesGroupArray:any[]  = [];

  private receiveGroupMessageSubscription: Subscription | undefined;
  private userCurrentSubscription: Subscription | undefined;
  private sendMessageGroupSubscription: Subscription | undefined;

  constructor(private groupService: GroupService, private signalGroupService: SignalGroupService, private userService: UserService) {

  /**
   * Se suscribe al observable para obtener el ultimo mensaje obtenido que se envía con signal.
   * 
   */
    this.userCurrentSubscription = this.userService.$userCurrent.subscribe((data: ApiResponse | null) => {
      if (data) {
        this.userCurrent = data.userdto
        this.userIdCurrent = data.userdto.userId
        console.log("USUARIO ACTUAL EN GRTUPOS: ", this.userCurrent)
      }
    });

  /**
   * Se suscribe al observable para obtener el ultimo mensaje obtenido que se envía con signal.
   * Se busca en el map si existe un array con mensaje del grupo al que estaba dirigindo el mensaje, si existe, se ingresa este ultimo mensaje. Si no existe se crea uno con el groupId del mensaje recibido, mas no con el que esta unido el usuario actual, ya que este puede cambiar.
   * Si el usuario actual es el mismo que envia ese mensaje entonces se obvia la muestra, ya que producto del observable este obtendra el ultimo enviado, entonces habría una repeticion si se agrega directamente desde aqui. Si es lo contrario, entonces se agrega a la interfaz manualmente.
   */
    this.messagesGroup = []
    this.receiveGroupMessageSubscription = this.signalGroupService.messageReceived$.subscribe((data: any) => {
      console.log("Mensaje de Grupo recibido: ", data)

      if(data) {
        if(!this.messagesGroupMap.has(data.groupId)){
          this.messagesGroupMap.set(data.groupId, [])
        }

        if(this.userIdCurrent !== data.userId){
          this.messagesGroupMap.get(data.groupId).push(
            {
              // groupName:data.groupName,
              messagesGroupId: data.messagesGroupId,
              groupId:data.groupId,
              username: data.user,
              userId: data.userId,
              messageText: data.message,
              messageDate: Date.now()
            }
          )
        }
        
        /**
         *! ESTA VALIDACION SOLO SIRVE PARA ARRAY MOMENTANEO PARA EVITAR LA CARGA DE MENSAJES EN OTROS GRUPOS.
         *! COMO EL ID DEL GRUPO QUE SE USA PARA OBTENER MENSAJES DEL MAP VIENE DEL QUIEN ENVIA EL MSG, ENTONCES AL PASARLO AL MAP, SI NO SE VALIDA PARA VER SI EL ID DEL GRUPO ACTUAL ES EL MISMO QUE EL QUE SE ENVIO EN MENSAJE Y SE USA PARA BUSCAR EN MAP, ENTONCES SE CARGARA CUALQUIER GRUPO CON LOS DATOS DEL ARRAY OBTENIDO.
         */
        // if(this.groupId == data.groupId){
        //   this.messagesGroupArray = this.messagesGroupMap.get(data.groupId)
        // }
        // 

        console.log("MAP PARA GUARDAD MENSAJES DE GRUPO: ", this.messagesGroupMap)
        console.log("MENSAJES DE GRUPO OBTENIDOS DESDE MAP: ", this.messagesGroupArray)
      }

    })


  }

  ngOnInit(): void {

  }
  
  /**
   * Con cada cambio del nombre de grupo se activa la obtencion del cache o mensajes directos desde servidor.
   * Me uno al grupo con JoinChatGroup
   * Me suscribo a loadMessagesGroup para obtener los mensajes ya sea de cache si ya se obtuvo en primera intancia, o de servidor si es la primera vez que se cambia a ese grupo
   * Si existe un array con el identificado de groupId dentro del map, se obtiene los mensajes de ahí y se le pasa al array que se usará para cargar en interfaz.
   * Si no existe un array dentro del map con el groupId como identificador entonces se crea uno, se le ingresa los mensajes enviados desde service y se le pasa tambien al array para la interfaz.
   */
  ngOnChanges(): void {
    this.messagesGroupArray = []
    if (this.nameGroup && this.groupId && this.groupParticipantsArray) {
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
        const messageFromSaveMessageToCache = {

          //! AQUI ESTA DEVOLVIENDO UN USERNAME EN UNDEFINED
          messagesGroupId: data.messagesGroupId,
          groupId:data.groupId,
          username: data.username,
          userId: data.userId,
          messageText: data.messageText,
          messageDate: data.messageDate
        }
        this.groupService.addMessageGroupToCache(this.groupId, messageFromSaveMessageToCache)
      })
      
      
    } else {
      console.error("Username is undefined. Cannot send message.");
    }
  }


  showParticipants(){
    this.isShowParticipant = !this.isShowParticipant
  }


  ShowShareGroup:boolean = true;
  showSharesGroup(){
    this.ShowShareGroup = !this.ShowShareGroup
    this.isShowSharesGroup.emit(this.ShowShareGroup)
  }


  ngOnDestroy(): void {
    if(this.userCurrentSubscription) this.userCurrentSubscription.unsubscribe()
    if(this.receiveGroupMessageSubscription) this.receiveGroupMessageSubscription.unsubscribe()
    if(this.sendMessageGroupSubscription) this.sendMessageGroupSubscription.unsubscribe()

  }
}
