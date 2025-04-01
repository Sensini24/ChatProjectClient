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