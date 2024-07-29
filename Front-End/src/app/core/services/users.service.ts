import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, lastValueFrom } from 'rxjs';
import { IUser } from '../interfaces/iuser';
import { Router } from '@angular/router';


type RegisterBody = { name: string, lastname: string, email: string, password: string}
type LoginBody = { email: string, password: string };
type LoginResponse = { error?: string, massage?: string, token?: string, user?: string }
type RecoverBody = { email: string }
type account = {name: string, lastname: string, email: string, password: string, photo: string}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private baseUrl: string = `${environment.apiUrl}/usuarios`;
  private httpClient = inject(HttpClient)
  private router = inject(Router)
  private userService: any;
  
  // BehaviorSubject maneja el estado del token de autenticación y notificar a los suscriptores cuando cambia
  private tokenSubject = new BehaviorSubject<string>(localStorage.getItem('token_usuario') || '');
  private encryptPassword(password: string): string {
    // Implementación de cifrado de contraseña (esto es solo un placeholder)
    return password; // Retorna la contraseña cifrada
  }
  // Observable público en que los componentes pueden suscribirse para obtener actualizaciones del token
  token$ = this.tokenSubject.asObservable();
  

  async fetchUserAccount() {
    try {
      const user: any = await this.userService.account();
      console.log('Datos del usuario:', user);
    } catch (error) {
      console.error('Error al obtener la cuenta del usuario:', error);
    }
  }

  private createHeaders(): HttpHeaders {
    const token = localStorage.getItem('token_usuario');
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }


  /**
   * Registra un nuevo usuario.
   * 
   * @param {RegisterBody} newUser - El cuerpo de la solicitud que contiene los datos del nuevo usuario.
   * @returns {Promise<IUser>} - Una promesa que se resuelve con los datos del usuario registrado.
   */
  async register(newUser: RegisterBody){
    const token = localStorage.getItem('authToken'); // Asumiendo que el token se almacena en localStorage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    try {
      const user = await firstValueFrom(
        this.httpClient.post<IUser>(`${this.baseUrl}/register`, newUser, /* { headers } */)
      );
      this.router.navigate(['/login']); // Redirige a la página de inicio
      return user;
    } catch (error) {
      console.error('Error durante el registro:', error);
      throw error;
    }
    
  }


  /**
   * Inicia sesión con las credenciales proporcionadas.
   * @param {LoginBody} body - El cuerpo de la solicitud que contiene el correo electrónico y la contraseña.
   * @returns {Promise<LoginResponse>} - Una promesa que se resuelve con la respuesta de inicio de sesión.
   */
  async login(body: LoginBody): Promise<LoginResponse> {
    try {
      const response = await firstValueFrom(
        this.httpClient.post<LoginResponse>(`${this.baseUrl}/login`, body)
      );
      if (response.token) {
        localStorage.setItem('token_usuario', response.token);
        this.tokenSubject.next(response.token); // Notificar a los suscriptores del cambio
      }
      this.router.navigate(['/home']); // Redirige a la página de inicio
      return response;
    } catch (error) {
      console.error('Error durante el login:', error);
      throw error;
    }
  }

  
  /**
   * Recupera la cuenta mediante el correo electrónico proporcionado.
   * 
   * @param {RecoverBody} body - El cuerpo de la solicitud que contiene el correo electrónico.
   * @returns {Promise<v>} - Una promesa que se resuelve cuando la solicitud de recuperación se completa.
   */
  recover(body: RecoverBody): Promise<any> {
    return firstValueFrom(
      this.httpClient.post<RecoverBody>(`${this.baseUrl}/request-password-reset`, body)
    );
  } 

  logout(): void {
    localStorage.removeItem('token_usuario');
    localStorage.removeItem('user_id')
    this.tokenSubject.next('');
  }


  getAll(): Promise<IUser> {
    return firstValueFrom(
      this.httpClient.get<IUser>(this.baseUrl, { headers: this.createHeaders() })
    );
  }

  /**
   * Obtiene el email de un usuario por su ID.
   * @param {string} userId - El ID del usuario.
   * @returns {Promise<{ email: string }>} - Una promesa que se resuelve con el email del usuario.
   */
  getEmailByUserId(userId: string): Promise<{ email: string }> {
    return firstValueFrom(
      this.httpClient.get<{ email: string }>(`${this.baseUrl}/${userId}/email`, { headers: this.createHeaders() })
    );
  }

    
  
 /**
   * Obtiene la información de la cuenta del usuario actual.
   * @returns {Promise<IUser>} - Una promesa que se resuelve con los datos del usuario.
   */
 async account(): Promise<IUser> {
  const token = localStorage.getItem('authToken'); // Asumiendo que el token se almacena en localStorage
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  try {
    return await firstValueFrom(this.httpClient.get<IUser>(`${this.baseUrl}/account`, { headers }));
  } catch (error: any) {
    console.error('Error al obtener la información de la cuenta:', error);
    throw error; 
  }
}

updateUser(userId: string, userDetailsActualizado: any): Promise<any> {
  const headers = this.createHeaders();
  // Asegúrate de que solo se envíe la contraseña si ha sido modificada
  console.log(userDetailsActualizado);

  if (userDetailsActualizado.password) {
    userDetailsActualizado.password = this.encryptPassword(userDetailsActualizado.password);
  }
  const requestObservable = this.httpClient.put(`${this.baseUrl}/${userId}`, userDetailsActualizado, { headers });
  return firstValueFrom(requestObservable);
}

updateUserPassword(userId: string, newPassword: string, token: string): Promise<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const passwordUpdate = {
    id: userId,
    newPassword: newPassword,
    token: token
  };

  const requestObservable = this.httpClient.post(`${this.baseUrl}/reset-password`, passwordUpdate, { headers });

  return firstValueFrom(requestObservable);
}
}
