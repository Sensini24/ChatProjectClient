export interface ApiGroupResponse{
    success : boolean,
    message : string,
    group : GroupGetDTO
}

export interface ApiGroupSimpleResponse{
    success : boolean,
    message : string,
    groups : GroupGetSimpleDTO[]
}


export interface GroupGetDTO{
    groupId : number,
    nameGroup : string,
    dateCreated : Date,
    isDeleted : boolean,
    groupCategory : string,
    groupParticipants : GroupParticipantsGetDTO[]
    groupMessages : GroupMessagesGetDTO[]
}

export interface GroupGetSimpleDTO{
    groupId : number,
    nameGroup : string,
    dateCreated : Date,
    isDeleted : boolean,
    groupCategory : string,
    groupParticipants : GroupParticipantsGetDTO[]
}

export interface GroupParticipantsGetDTO{
    groupParticipantsId : number,
    userId : number,
    groupId : number,
    dateJoined : Date,
    rol : string,
    isFavorite : boolean

}

export interface GroupMessagesGetDTO{
    messagesGroupId : number,
    userId : number,
    groupId : number,
    messageText : string,
    messageDate : Date
}


export interface GroupAddDTO{
    nameGroup :string
    groupCategory : string
    groupParticipants: GroupParticipantsAddDTO[]
}

export interface GroupParticipantsAddDTO{
    userId : number
}