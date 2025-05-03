export interface ApiResponseFileUpload{
    message:string,
    fileNames:string[],
}

export interface UploadFile{
    chatId:number,
    file:File
}