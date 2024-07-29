export interface IUser {
    _id: string;
    name: string;
    username?: string;
    lastname: string;
    photo: string;
    email: string;
    password?: string;
    total_grupos_comunes?: number;
    friends?:[],
}
