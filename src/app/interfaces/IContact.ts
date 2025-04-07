export interface ApiResponseContact{
    success:boolean,
    message:string,
    contacts:Contact[]
}

export interface Contact {
    contactId:number,
    userId:number,
    contactUserId: number,
    nickName?: string,
    dateAdded: Date,
    isFavorite: boolean,
    isDeleted: boolean,
    isBlocked: boolean
}