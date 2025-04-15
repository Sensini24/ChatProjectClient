import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { GroupService } from '../../services/group.service';
import { CommonModule } from '@angular/common';
import { SignalGroupService } from '../../signalsService/signal-group.service';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { ApiResponse, User } from '../../interfaces/IUser';

@Component({
  selector: 'app-group',
  imports: [CommonModule],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css'
})
export class GroupComponent implements OnInit, OnChanges, OnDestroy {
  @Input() groupId:number = 0;
  @Input() nameGroup:string = "";

  messagesGroup:any[] = []
  userCurrent:User | undefined
  userIdCurrent:number = 0
  private receiveGroupMessageSubscription:Subscription | undefined;
  private userCurrentSubscription:Subscription | undefined;
  constructor(private groupService : GroupService, private signalGroupService: SignalGroupService, private userService:UserService){
    this.userCurrentSubscription = this.userService.$userCurrent.subscribe((data: ApiResponse | null) => {
      if (data) {
        this.userCurrent = data.userdto
        this.userIdCurrent = data.userdto.userId
        console.log("USUARIO ACTUAL EN GRTUPOS: ", this.userCurrent)
      }
    });
    this.messagesGroup = []
    this.receiveGroupMessageSubscription = this.signalGroupService.messageReceived$.subscribe((data:any)=>{
      console.log("Mensaje de Grupo recibido: ", data)
      
      if(data){
        this.messagesGroup.push(data)
      }
      
    })
    
    
  }

  ngOnInit(): void {
    
  }

  ngOnChanges(): void {
    this.messagesGroup = []
    if(this.nameGroup && this.groupId){
      this.signalGroupService.JoinChatGroup(this.nameGroup);
      console.log("Nombre de grupo: ", this.nameGroup)
    }
  }



  sendGroupMessage(inputValue:HTMLInputElement){
    console.log("ELEMENTO ESCRITO: ", inputValue.value)
    if (this.userCurrent) {
      this.signalGroupService.SendMessageToGroup(this.nameGroup, this.userCurrent.username, inputValue.value);
    } else {
      console.error("Username is undefined. Cannot send message.");
    }
  }

  
  ngOnDestroy(): void {
    if(this.userCurrentSubscription){
      this.userCurrentSubscription.unsubscribe()
    }

    if(this.receiveGroupMessageSubscription){
      this.receiveGroupMessageSubscription.unsubscribe()
    }
    
  }


}
