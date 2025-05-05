import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ShareService } from '../../services/share.service';
import { Subscription } from 'rxjs';
import { FilePrivateChatGetDTO } from '../../interfaces/IShare';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shares',
  imports: [CommonModule],
  templateUrl: './shares.component.html',
  styleUrl: './shares.component.css'
})
export class SharesComponent implements OnChanges {
  @Input() nameChat: string = ""

  private getPrivateFilesChatSubscription: Subscription | undefined

  isShowFiles: boolean = false
  isShowPhotos: boolean = false
  isShowMovies: boolean = false
  isShowOther: boolean = false

  filesPrivateChat: FilePrivateChatGetDTO[] = []

  constructor(private shareService: ShareService) {

  }

  ngOnChanges(): void {
    if (this.nameChat) {
      this.filesPrivateChat = [];
      console.log("NOMBRE DE CHAT DESDE SHARE: ", this.nameChat);
      this.getPrivateFilesChatSubscription = this.shareService.getPrivateChatFiles(this.nameChat).subscribe((files: FilePrivateChatGetDTO[]) => {
        console.log("ARCHIVOS POR CHAT PRIVADO: ", files)
        this.filesPrivateChat = files;
      })
    }
  }

  showFiles(type: string) {
    console.log("tipo de archivo: ", type)
    switch (type) {
      case "photo": {
        this.isShowPhotos = !this.isShowPhotos;
        break;
      }
      case "file": {
        this.isShowFiles = !this.isShowFiles;
        break;
      }
      case "movie": {
        this.isShowMovies = !this.isShowMovies;
        break;
      }
      case "other": {
        this.isShowOther = !this.isShowOther;
        break;
      }
    }

  }

}
