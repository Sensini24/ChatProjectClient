import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, pipe, tap } from 'rxjs';
import { ApiGroupResponse, ApiGroupSimpleResponse, GroupAddDTO, GroupGetDTO, GroupGetSimpleDTO } from '../interfaces/IGroup';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  apiUrlCreateGroup: string = "https://localhost:7119/api/Group/createGroup"
  apiUrlGetGroups: string = "https://localhost:7119/api/Group/getGroups"

  createGroupSubject = new BehaviorSubject<GroupGetDTO | null>(null);
  createGroup$ = this.createGroupSubject.asObservable();

  getGroupsByUserSubject =  new BehaviorSubject<GroupGetSimpleDTO[] | null>(null);
  getGroupsByUser$ = this.getGroupsByUserSubject.asObservable()

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
}
