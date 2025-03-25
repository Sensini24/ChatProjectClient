import { Component, OnInit } from '@angular/core';
import { User } from '../../interfaces/IUser';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone:true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  users:User[]= []

  constructor(private userService:UserService){}
  ngOnInit(): void {
    this.userService.GetUsers().subscribe(data=>{
      this.users = data;
      // console.log(this.users);
      console.log(this.users, typeof this.users[0].userId);
    })
  }
}
