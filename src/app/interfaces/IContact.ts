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


export interface ApiResponseAddContact{
    success:boolean,
    message:string,
    contactaddto:Contact
}

export interface ContactAddDTO{
    userId:number,
    contactUserId: number,
    nickName?: string
}