/**
 * Interfaces para obtener Grupos y participantes
 */
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

export interface ApiGroupSearchedResponse{
    success : boolean,
    message : string,
    groups : GroupSearchedGetDTO[]
}

export interface ApiGroupParticipantsJoinResponse{
    success : boolean,
    message : string,
    groupParticipant : GroupParticipantsGetDTO
}

export interface GroupGetSimpleDTO{
    groupId : number,
    nameGroup : string,
    dateCreated : Date,
    isDeleted : boolean,
    groupCategory : string,
    groupParticipants : GroupParticipantsGetDTO[]
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

export interface GroupSearchedGetDTO{
    groupId : number,
    nameGroup : string,
    dateCreated : Date,
    isDeleted : boolean,
    groupCategory : string
}


export interface ApiGroupMessagesResponse{
    success : boolean,
    message : string,
    messages : GroupMessagesGetDTO[]
}

export interface GroupParticipantsGetDTO{
    groupParticipantsId : number,
    userId : number,
    groupId : number,
    dateJoined : Date,
    rol : string,
    isFavorite : boolean

}

/**
 * Interfaces para crear grupo, guardarlo junto con el que lo crea como participante.
 */
export interface GroupAddDTO{
    nameGroup :string
    groupCategory : string
    groupParticipants: GroupParticipantsAddDTO[]
}

export interface GroupParticipantsAddDTO{
    userId : number
}

export interface GroupParticipantsJoinAddDTO{
    userId: number,
    groupId: number,
    invitationStatus: string
}


/** INTERFACES DE MENSAJES DE GRUPO
 * Interfaces para obtener mensajes de cada grupo
 */
export interface GroupMessagesGetDTO{
    messagesGroupId : number,
    userId : number,
    username: string,
    groupId : number,
    messageText : string,
    messageDate : Date
}

/**
 * Interfaces para guardar mensajes individuales en base de datos.
 */
export interface ApiGroupMessageResponse{
    success : boolean,
    message : string,
    groupMessage : GroupMessagesGetDTO
}

export interface GroupMessageAddDTO{
    userId : number,
    groupId : number,
    messageText : string
}

