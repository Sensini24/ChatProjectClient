import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, pipe, tap } from 'rxjs';
import { ApiGroupMessageResponse, ApiGroupMessagesResponse, ApiGroupParticipantsJoinResponse, ApiGroupResponse, ApiGroupSearchedResponse, ApiGroupSimpleResponse, GroupAddDTO, GroupGetDTO, GroupGetSimpleDTO, GroupMessageAddDTO, GroupMessagesGetDTO, GroupParticipantsGetDTO, GroupParticipantsJoinAddDTO, GroupSearchedGetDTO } from '../interfaces/IGroup';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  apiUrlCreateGroup: string = "https://localhost:7119/api/Group/createGroup"
  apiUrlGetGroupsByUser: string = "https://localhost:7119/api/Group/getGroupsByUser"
  apiUrlGetGroups: string = "https://localhost:7119/api/Group/getGroups"
  apiUrlGetMessagesByGroup: string = "https://localhost:7119/api/Group/getMessagesByGroup"
  apiUrlAddMessagesGroup: string = "https://localhost:7119/api/Group/saveMessageGroup"
  apiUrlFindGroupsByInitials:string = "https://localhost:7119/api/Group/searchGroup"
  apiUrlAddGroupParticipants:string = "https://localhost:7119/api/Group/joinGroup"

  createGroupSubject = new BehaviorSubject<GroupGetDTO | null>(null);
  createGroup$ = this.createGroupSubject.asObservable();

  getGroupsByUserSubject =  new BehaviorSubject<GroupGetSimpleDTO[] | null>(null);
  getGroupsByUser$ = this.getGroupsByUserSubject.asObservable()

  getMessagesGroupByGroup = new BehaviorSubject<GroupMessagesGetDTO[] | null>(null);
  requestFromAddMesageGroup = new BehaviorSubject<GroupMessagesGetDTO | null>(null);

  getGroupsSubject = new BehaviorSubject<GroupSearchedGetDTO[] | null>(null);
  getGroups$ = this.getGroupsSubject.asObservable();

  getFoundedGroupsSubject = new BehaviorSubject<GroupSearchedGetDTO[] | null>(null);
  getFoundedGroups$ = this.getFoundedGroupsSubject.asObservable();

  getGroupParticipantSubject = new BehaviorSubject<GroupParticipantsGetDTO | null>(null);
  getGroupParticipant$ = this.getFoundedGroupsSubject.asObservable();

  messagesGroupCache: Map<number, any> = new Map<number, any>()

  constructor(private http: HttpClient) { 
    this.GetGroupsByUser();
    this.GetGroups();
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
          username: data.groupMessage.username,
          groupId: data.groupMessage.groupId,
          messageText: data.groupMessage.messageText,
          messageDate: data.groupMessage.messageDate
        }
        return messageDto
      })
    )
  }


  JoinGroup(gpBody:GroupParticipantsJoinAddDTO):Observable<GroupParticipantsGetDTO>{
    return this.http.post<ApiGroupParticipantsJoinResponse>(this.apiUrlAddGroupParticipants, gpBody,{
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }).pipe(
      map(data=> data.groupParticipant || []),
      tap(groupParticipant=>{
        this.getGroupParticipantSubject.next(groupParticipant)
      })
    )
  }

  GetGroups():void{
    this.http.get<ApiGroupSearchedResponse>(this.apiUrlGetGroups,{
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }).pipe(
      tap(data=>{
        console.log("Grupos recibidos: ", data.groups)
        this.getGroupsSubject.next(data.groups)
      })
    ).subscribe()
  }

  GetGroupsByUser(): void {
    this.http.get<ApiGroupSimpleResponse>(this.apiUrlGetGroupsByUser, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }).pipe(
      tap(apidata => {
        // console.log("API DATA GRUPOS COMPLETA: ", apidata); 
        this.getGroupsByUserSubject.next(apidata.groups); 
      })
    ).subscribe(); 
  }

  FindGroups(initialsGroup:string):Observable<GroupSearchedGetDTO[]>{
    return this.http.get<ApiGroupSearchedResponse>(this.apiUrlFindGroupsByInitials + `/${initialsGroup}`, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }).pipe(
      map(data => data.groups || []),
      tap(groups => {
        this.getFoundedGroupsSubject.next(groups);
      })
    )
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
          username:message.username,
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
