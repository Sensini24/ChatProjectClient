import { Component } from '@angular/core';
import { GroupService } from '../../services/group.service';

@Component({
  selector: 'app-group',
  imports: [],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css'
})
export class GroupComponent {

  constructor(groupService : GroupService){}

  

}
