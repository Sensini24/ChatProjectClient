import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponseFileUpload, UploadFile } from '../interfaces/IShare';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  private uploadFileSubject = new BehaviorSubject<ApiResponseFileUpload | null>(null);

  apiUrlUploadFile:string = "https://localhost:7119/api/File/newFile"

  constructor(private http:HttpClient) { }


  // uploadFile(files:FileList):Observable<ApiResponseFileUpload>{

  //   const formData = new FormData();
  //   for (let i = 0; i < files.length; i++) {
  //     const file = files[i];
  //     formData.append('files', file); // 'iles' debe coincidir con lo que espera el backendf
  //   }
  //   console.error("ARCHIVOS ANTES DE SUBIR: ", formData)
  //   return this.http.post<ApiResponseFileUpload>(this.apiUrlUploadFile, formData, {
  //     // headers: { 'Content-Type': 'multipart/form-data' },
  //     withCredentials: true,
  //   })
  //   // .pipe(
  //   //   tap(api=>{
  //   //     console.log("Nombres de files subidos: ", api.fileNames)
  //   //   })
  //   // )
    
  // }

  uploadFile(formData:FormData):Observable<ApiResponseFileUpload>{

    return this.http.post<ApiResponseFileUpload>(this.apiUrlUploadFile, formData, {
      // headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    })
    // .pipe(
    //   tap(api=>{
    //     console.log("Nombres de files subidos: ", api.fileNames)
    //   })
    // )
    
  }

}
