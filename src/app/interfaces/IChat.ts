export interface Chat{
    NameChat :string,
    Messages : Message[],
    ChatParticipants : ChatParticipants[]
}


export interface Message{
    UserId : number,
    MessageText : string
}

export interface ChatParticipants{
    UserId: number
}


// ObtenerChats

export interface ApiResponseChat{
    success:boolean,
    message:string,
    chatDto:ChatGet
}
export interface ChatGet{
    nameChat :string,
    messages : MessageGet[],
    ChatParticipants : ChatParticipantsGet[]
}


export interface MessageGet{
    Id: number,
    UserId : number,
    ChatId:number,
    MessageText : string
    MessageDate : Date,
    IsRead:boolean,
    IsDeleted:boolean
}

export interface ChatParticipantsGet{
    Id: number,
    UserId: number,
    ChatId:number
}
