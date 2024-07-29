import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core"
import { environment } from "../../../environments/environment.development";
import { IUser } from "../interfaces/iuser";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class FriendsService {
    private baseUrl: string = `${environment.apiUrl}/amigos`;
    private httpClient = inject(HttpClient);

    private createHeaders(): HttpHeaders {
        const token = localStorage.getItem('token_usuario');
        if (!token) {
            throw new Error('Token de autenticación no encontrado');
        }
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    getAllFriend(): Promise<IUser[]> {
        return firstValueFrom(this.httpClient.get<IUser[]>(this.baseUrl, { headers: this.createHeaders() }))
    }


    addFriend(userId: number, friendEmail: string): Promise<{ message: string, friendId: number }> {
        const body = { userId, friendEmail };
        return firstValueFrom(this.httpClient.post<{ message: string, friendId: number }>(this.baseUrl, body, { headers: this.createHeaders() }));
      }

    deleteFriend(friendId: string): Promise<void> {
        const url = `${this.baseUrl}/${friendId}`;
        return firstValueFrom(this.httpClient.delete<void>(url,  { headers: this.createHeaders() }));
    }
}