import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponseFileUpload, UploadFile } from '../interfaces/IShare';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  private getPrivateChatFilesSubject = new BehaviorSubject<ApiResponseFileUpload | null>(null);
  public getFilesPrivate$ = this.getPrivateChatFilesSubject.asObservable();

  apiUrlUploadFile:string = "https://localhost:7119/api/File/newFile"
  apiUrlGetPrivateChatFiles:string = "https://localhost:7119/api/File/getFilesChatPrivate"

  constructor(private http:HttpClient) { }


  uploadFile(formData:FormData):Observable<ApiResponseFileUpload>{
    return this.http.post<ApiResponseFileUpload>(this.apiUrlUploadFile, formData, {
      // headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    })
  }

}
