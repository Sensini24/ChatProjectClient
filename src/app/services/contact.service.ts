import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable, tap } from 'rxjs';
import { ApiResponseContact, Contact } from '../interfaces/IContact';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  apiUrlContacts:string = "https://localhost:7119/api/Contact/getContacts"

  private contactsSubject = new BehaviorSubject<Contact[] | null>(null);
  public contacts$ = this.contactsSubject.asObservable();

  constructor(private http:HttpClient) { 
    this.GetContacts()
  }

  GetContacts(): void {
    this.http.get<ApiResponseContact>(this.apiUrlContacts, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }).pipe(
      tap(apidata => {
        console.log("API DATA CONTACTS COMPLETA: ", apidata); // Puedes loguear la respuesta completa si quieres
        this.contactsSubject.next(apidata.contacts); // Pasa la lista de contactos al Subject
      })
    ).subscribe(); // ¡Importante suscribirse para que la petición se ejecute!
  }

}
