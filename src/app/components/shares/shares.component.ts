import { Component } from '@angular/core';

@Component({
  selector: 'app-shares',
  imports: [],
  templateUrl: './shares.component.html',
  styleUrl: './shares.component.css'
})
export class SharesComponent {
isShowFiles:boolean = false
isShowPhotos:boolean = false
isShowMovies:boolean = false
isShowOther:boolean = false
  showFiles(type:string){
    console.log("tipo de archivo: ", type)
    switch(type){
      case "photo":{
        this.isShowPhotos = !this.isShowPhotos;
        break;
      }
      case "file":{
        this.isShowFiles = !this.isShowFiles;
        break;
      }
      case "movie":{
        this.isShowMovies = !this.isShowMovies;
        break;
      }
      case "other":{
        this.isShowOther = !this.isShowOther;
        break;
      }
    }
    
  }
}
