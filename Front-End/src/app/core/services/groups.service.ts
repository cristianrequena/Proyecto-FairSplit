import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IGroup } from '../interfaces/igroup';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private baseUrl: string = `${environment.apiUrl}/grupos`;
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

  getAll(): Promise<IGroup[]> {
    return firstValueFrom(
      this.httpClient.get<IGroup[]>(this.baseUrl, { headers: this.createHeaders() })
    );
  }

  getById(id: string): Promise<IGroup> {
    console.log(`${this.baseUrl}/${id}`);
    return firstValueFrom(
      this.httpClient.get<IGroup>(`${this.baseUrl}/${id}`)
    );
  }

  delete(id: string): Promise<IGroup> {
    return firstValueFrom(
      this.httpClient.delete<IGroup>(`${this.baseUrl}/${id}`, { headers: this.createHeaders() })
    );
  }

  insert(groupData: IGroup): Promise<IGroup> {
    return firstValueFrom(
      this.httpClient.post<IGroup>(this.baseUrl, groupData, { headers: this.createHeaders() })
    );
  }

  create(newGroup: IGroup): Promise<IGroup> {
    return firstValueFrom(
      this.httpClient.post<IGroup>(this.baseUrl, newGroup, { headers: this.createHeaders() })
    );
  }
}
