import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, pipe, tap } from 'rxjs';
import { ApiGroupMessageResponse, ApiGroupMessagesResponse, ApiGroupResponse, ApiGroupSimpleResponse, GroupAddDTO, GroupGetDTO, GroupGetSimpleDTO, GroupMessageAddDTO, GroupMessagesGetDTO } from '../interfaces/IGroup';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  apiUrlCreateGroup: string = "https://localhost:7119/api/Group/createGroup"
  apiUrlGetGroups: string = "https://localhost:7119/api/Group/getGroups"
  apiUrlGetMessagesByGroup: string = "https://localhost:7119/api/Group/getMessagesByGroup"
  apiUrlAddMessagesGroup: string = "https://localhost:7119/api/Group/saveMessageGroup"

  createGroupSubject = new BehaviorSubject<GroupGetDTO | null>(null);
  createGroup$ = this.createGroupSubject.asObservable();

  getGroupsByUserSubject =  new BehaviorSubject<GroupGetSimpleDTO[] | null>(null);
  getGroupsByUser$ = this.getGroupsByUserSubject.asObservable()

  getMessagesGroupByGroup = new BehaviorSubject<GroupMessagesGetDTO[] | null>(null);
  requestFromAddMesageGroup = new BehaviorSubject<GroupMessagesGetDTO | null>(null);

  messagesGroupCache: Map<number, any> = new Map<number, any>()

  constructor(private http: HttpClient) { 
    this.GetGroupsByUser()
  }

  CreateGroup(group:GroupAddDTO):Observable<ApiGroupResponse>{
    return this.http.post<ApiGroupResponse>(this.apiUrlCreateGroup,group, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }).pipe(
      tap(apidata=>{
        this.createGroupSubject.next(apidata.group)
      })
    )
  }

  SaveMessageGroup(messageGroupBody:GroupMessageAddDTO):Observable<GroupMessagesGetDTO>{
    return this.http.post<ApiGroupMessageResponse>(this.apiUrlAddMessagesGroup, messageGroupBody,{
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }).pipe(
      map(data=>{
        this.requestFromAddMesageGroup.next(data.groupMessage)
        const messageDto = {
          messagesGroupId: data.groupMessage.messagesGroupId,
          userId: data.groupMessage.userId,
          groupId: data.groupMessage.groupId,
          messageText: data.groupMessage.messageText,
          messageDate: data.groupMessage.messageDate
        }
        return messageDto
      })
    )
  }

  GetGroupsByUser(): void {
    this.http.get<ApiGroupSimpleResponse>(this.apiUrlGetGroups, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }).pipe(
      tap(apidata => {
        // console.log("API DATA GRUPOS COMPLETA: ", apidata); 
        this.getGroupsByUserSubject.next(apidata.groups); 
      })
    ).subscribe(); 
  }

  GetMessagesGroupByGroup(groupId:number):Observable<ApiGroupMessagesResponse>{
    return this.http.get<ApiGroupMessagesResponse>(this.apiUrlGetMessagesByGroup + `/${groupId}`, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    })
  }

  loadMessagesGroup(groupId:number): Observable<GroupMessagesGetDTO[]>{
    if(this.messagesGroupCache.has(groupId)){
      this.getMessagesGroupByGroup.next(this.messagesGroupCache.get(groupId))
      console.log("MENSAJES DESDE CACHE DE GRUPO: ", this.messagesGroupCache.get(groupId))
      return new Observable(subscriber => {
        subscriber.next(this.messagesGroupCache.get(groupId));
        subscriber.complete();
      });
    }

    return this.GetMessagesGroupByGroup(groupId).pipe(
      map(api => {
        console.log("api reponse group: ", api)
        if( api.success == false) return []
        const dataGetFiltered = api.messages?.map(message => ({
          messagesGroupId: message.messagesGroupId,
          userId: message.userId,
          groupId: message.groupId,
          messageText: message.messageText,
          messageDate: message.messageDate
        }));
        return dataGetFiltered;
      }),
      tap(dataGetFiltered => {
        this.messagesGroupCache.set(groupId, dataGetFiltered);
        console.log("Mensajes obtenidos desde servidor: ", dataGetFiltered);
      })
    );
  }



  addMessageGroupToCache(groupId: number, newMessageGroup: any): void {
    const cachedMessages = this.messagesGroupCache.get(groupId);
    console.log("TIpo de cahce: ", cachedMessages)
    if (cachedMessages) {
      cachedMessages.push(newMessageGroup);
      this.messagesGroupCache.set(groupId, cachedMessages);
      // this.privateChatSubject.next(cachedMessages);
    } else {
      console.error('Error: Invalid structure in cached data for adding message.');
    }
  }
  
}
