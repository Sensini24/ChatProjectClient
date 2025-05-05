export interface ApiResponseFileUpload{
    message:string,
    fileNames:string[],
}

export interface UploadFile{
    nameChat:string,
    file:File
}

export interface ApiResponseGetFilesChat{
    message:string,
    succes:boolean,
    files: FilePrivateChatGetDTO[]
}

export interface FilePrivateChatGetDTO{
    id:number,
    userId:number,
    chatId:number,
    fileName:string,
    fileSize:number,
    uploadDate:Date,
    fileType:string,
    fileExtension:string
}