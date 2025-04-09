import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ContactsComponent } from './components/contacts/contacts.component';

export const routes: Routes = [
    { path: "", title:"Login", component: LoginComponent, pathMatch: "full" },
    { path: "chat", title:"Chat", component: ContactsComponent, pathMatch: "full" }
];
