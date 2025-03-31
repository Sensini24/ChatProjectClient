export interface User{
    userId : number;
    username : string;
    email : string;
    gender : string;
}

export interface UserDTO{
    userId : number;
    username : string;
    email : string;
    gender : string;
}

export interface ApiResponse{
    success : boolean,
    userdto: UserDTO
}

export interface manyApiResponse{
    success : boolean,
    userdto: UserDTO[]
}
