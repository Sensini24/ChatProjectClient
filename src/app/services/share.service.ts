import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponseFileUpload, ApiResponseGetFilesChat, FilePrivateChatGetDTO, UploadFile } from '../interfaces/IShare';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  private getPrivateChatFilesSubject = new BehaviorSubject<FilePrivateChatGetDTO[] | null>(null);
  public getFilesPrivate$ = this.getPrivateChatFilesSubject.asObservable();

  apiUrlUploadFile: string = "https://localhost:7119/api/File/newFile"
  apiUrlGetPrivateChatFiles: string = "https://localhost:7119/api/file/getfileschatprivate"
  apiUrlDowloadFIle: string = "https://localhost:7119/api/file/dowloadFile"

  constructor(private http: HttpClient) { }


  uploadFile(formData: FormData): Observable<ApiResponseFileUpload> {
    return this.http.post<ApiResponseFileUpload>(this.apiUrlUploadFile, formData, {
      // headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    })
  }

  getPrivateChatFiles(nameChat: string): Observable<FilePrivateChatGetDTO[]> {
    return this.http.get<ApiResponseGetFilesChat>(this.apiUrlGetPrivateChatFiles + `/${nameChat}`, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    }).pipe(
      tap(api => {
        console.log("Respuesta de servidor para obtener files: ", api)
      }),
      map(api => {
        this.getPrivateChatFilesSubject.next(api.files);
        return api.files;
      })
    );
  }

  dowloadFile(idFile: number): Observable<any> {
    return this.http.get(this.apiUrlDowloadFIle + `/${idFile}`, {
      responseType: 'blob',
      //headers: { 'Content-Type': 'application/json' },
      //responseType: 'blob' as 'json',
      withCredentials: true
    })
  }

}
