import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
    { path: "users", title:"Usuarios", component: LoginComponent, pathMatch: "full" }
];
