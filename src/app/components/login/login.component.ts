import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/IUser';
import { UserRegister } from '../../interfaces/IUserRegister';
import { UserLogin } from '../../interfaces/IUserLogin';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone:true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{

  
  constructor(private authService:AuthService){}

  ngOnInit(): void {
    
  }


  formLogin = new FormGroup({
    email : new FormControl("", [Validators.email, Validators.required]),
    password : new FormControl("", Validators.required)
  })

  
  tipo:string = 'password';
  isText:boolean = false;
  isHidenLogin:boolean=false;
  isHidenRegister:boolean = true;

  
  usuarioLogin:UserLogin = {
    email : "",
    password : ""
  }

  onSubmitLogin(){
    const email = this.formLogin.value.email?.trim();
    const password = this.formLogin.value.password?.trim();
    if(!this.formLogin.valid){
      
      if (!email && !password) {
        console.log("Falta email o contraseña");
        return;
      }
      if(!email){
        console.log("Falta email");
        return;
      }

      if(!password){
        console.log("Falta password");
        return;
      }

      
    }else{
      this.usuarioLogin = {
        email : this.formLogin.value.email ?? "",
        password: this.formLogin.value.password ?? "",
      }

      console.log(this.usuarioLogin)

      this.authService.LoginUser(this.usuarioLogin).subscribe({
        next:data=>{
          console.log("Credenciales correctas: ", data)
          window.location.href = "/chat"
        },
        error:err=>{
          if (err.status === 401) {
            console.log("Credenciales incorrectas: ",  err.error); 
          } else {
            console.log("Error inesperado:", err);
          }
        }
      })
    }
  }


  showPassword(){
    this.isText = !this.isText;
    this.isText ? this.tipo = 'text' : this.tipo = 'password'
  }

  changeForms(){
    this.isHidenLogin = !this.isHidenLogin
    this.isHidenRegister = !this.isHidenRegister
  }


  formRegister = new FormGroup({
    nombreCompleto : new FormControl(),
    emailRegister : new FormControl(),
    passwordRegister : new FormControl(),
    generoRegister : new FormControl()
  })

  

  usuarioRegister:UserRegister = {
    username : "",
    email : "",
    passwordHash : "",
    gender : 0,
  }

  dataRegisterForm(){
    if(this.formRegister.valid){
      

      this.usuarioRegister = {
        username : this.formRegister.value.nombreCompleto,
        email : this.formRegister.value.emailRegister,
        passwordHash : this.formRegister.value.passwordRegister,
        gender : Number(this.formRegister.value.generoRegister),
      }
      console.log(this.usuarioRegister)

      this.authService.RegisterUser(this.usuarioRegister).subscribe({
        next: data => console.log("Registro exitoso", data),
        error: err => console.log("Error en la solicitud", err.error) // <-- Ver detalles del error
      });


      
    }else{
      console.log("Error de guardado de usuario")
    }
    
  }


}
