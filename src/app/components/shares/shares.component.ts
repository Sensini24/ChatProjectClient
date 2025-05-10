import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ShareService } from '../../services/share.service';
import { Subscription } from 'rxjs';
import { FilePrivateChatGetDTO } from '../../interfaces/IShare';
import { CommonModule } from '@angular/common';
import { count } from 'node:console';

@Component({
  selector: 'app-shares',
  imports: [CommonModule],
  templateUrl: './shares.component.html',
  styleUrl: './shares.component.css'
})
export class SharesComponent implements OnChanges, OnInit, OnDestroy {
  @Input() nameChat: string = ""


  private getPrivateFilesChatSubscription: Subscription | undefined
  private dowloadFileSubscription: Subscription | undefined

  isShowFiles: boolean = false
  isShowPhotos: boolean = false
  isShowMovies: boolean = false
  isShowOther: boolean = false

  filesPrivateChat: FilePrivateChatGetDTO[] = []
  allSizeFiles: number = 0;
  allCountFiles: number = 0;
  constructor(private shareService: ShareService) {

  }

  ngOnInit(): void {
    this.getPrivateFilesChatSubscription = this.shareService.getFilesPrivate$.subscribe((files: FilePrivateChatGetDTO[] | null) => {
      this.filesPrivateChat = []
      if (files) {
        this.filesPrivateChat = files;
        let size = 0;
        let countFiles = 0;
        // files.forEach(e => {
        //   size += e.fileSize
        // })
        for (let index = 0; index < files.length; index++) {
          size += files[index].fileSize;

          countFiles++;
        }

        this.allSizeFiles = parseFloat(size.toFixed(3))
        this.allCountFiles = countFiles;
      }
    })
  }
  /*
   * ngOnChanges(): void {
     if (this.nameChat) {
       this.filesPrivateChat = [];
       console.log("NOMBRE DE CHAT DESDE SHARE: ", this.nameChat);
       this.getPrivateFilesChatSubscription = this.shareService.getPrivateChatFiles(this.nameChat).subscribe((files: FilePrivateChatGetDTO[]) => {
         console.log("ARCHIVOS POR CHAT PRIVADO: ", files)
         this.filesPrivateChat = files;
       })
     }
   }
   */

  ngOnChanges(): void {
    if (this.nameChat) {
      console.log("NOMBRE DE CHAT DESDE SHARE: ", this.nameChat);
      this.allSizeFiles = 0;
      this.allCountFiles = 0;
      this.getPrivateFilesChatSubscription = this.shareService.getPrivateChatFiles(this.nameChat).subscribe((files: FilePrivateChatGetDTO[]) => {
        console.log("ARCHIVOS POR CHAT PRIVADO: ", files)
      })
    } else {
      this.filesPrivateChat = []
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

  dowloadFile(fileName: string, fileId: number) {
    this.dowloadFileSubscription = this.shareService.dowloadFile(fileId).subscribe(response => {
      const dataType = response.type;
      console.log("Respuesta de descagara: ", response)
      console.log("Tipo de dato de archivo descargado: ", dataType);

      const binaryData = [];
      binaryData.push(response);

      const filePath = window.URL.createObjectURL(new Blob(binaryData, { type: dataType }));
      const dowloadLink = document.createElement('a');
      dowloadLink.href = filePath;
      dowloadLink.setAttribute('download', fileName)
      document.body.appendChild(dowloadLink);
      dowloadLink.click();
      URL.revokeObjectURL(filePath);
    })
    console.log("Archivo clicado: ", fileName, fileId);
  }


  ngOnDestroy(): void {
    if (this.getPrivateFilesChatSubscription) this.getPrivateFilesChatSubscription.unsubscribe()
    if (this.dowloadFileSubscription) this.dowloadFileSubscription.unsubscribe();
  }

}
