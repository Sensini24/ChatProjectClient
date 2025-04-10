import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable, tap } from 'rxjs';
import { ApiResponseAddContact, ApiResponseContact, Contact, ContactAddDTO } from '../interfaces/IContact';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  apiUrlContacts:string = "https://localhost:7119/api/Contact/getContacts"
  apiUrlAddContact:string = "https://localhost:7119/api/Contact/addContact"

  private contactsSubject = new BehaviorSubject<Contact[] | null>(null);
  public contacts$ = this.contactsSubject.asObservable();

  private addContactSubject = new BehaviorSubject<ContactAddDTO| null>(null);
  public addcontact$ = this.addContactSubject.asObservable();

  constructor(private http:HttpClient) { 
    this.GetContacts()
  }

  GetContacts(): void {
    this.http.get<ApiResponseContact>(this.apiUrlContacts, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }).pipe(
      tap(apidata => {
        console.log("API DATA CONTACTS COMPLETA: ", apidata); 
        this.contactsSubject.next(apidata.contacts); 
      })
    ).subscribe(); 
  }

  AddContact(contacto:ContactAddDTO): Observable<ApiResponseAddContact| undefined> {
    return this.http.post<ApiResponseAddContact>(this.apiUrlAddContact, contacto, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }).pipe(
      tap(apidata => {
        console.log("GUARDADO DE CONTACTO ", apidata);
        this.addContactSubject.next(apidata.contactaddto);
      })
    )
    
  }

}
