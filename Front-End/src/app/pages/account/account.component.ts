// account.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersService } from '../../core/services/users.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent {
  name = '';
  lastname = '';
  email = '';
  password = '';
  newPassword = '';
  newPasswordVisible = false;
  passwordVisible = false;
  photo: string | undefined;
  usuarios: any[] = [];
  id: string | null = null;
  photo_url: string | undefined; // Añadir esta propiedad

  activatedRouter = inject(ActivatedRoute);
  baseUrl: string;
  httpClient: HttpClient;
  cambiarpassword = false;
  userId: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder,
    private usersService: UsersService,
    private activatedRoute: ActivatedRoute
  ) {
    this.baseUrl = ''; // Inicializar con un valor por defecto o configurar adecuadamente
    this.httpClient = http; // Asegurarse de que httpClient esté correctamente inicializado
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.activatedRoute.params.subscribe(async (params: any) => {
      this.userId = localStorage.getItem('user_id');
      this.obtenerUsuarios(this.userId);
    });
  }

  obtenerUsuarios(id: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token_usuario')
    });
    this.http.get(`http://localhost:3000/api/usuarios/${id}`, { headers }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.name = response.name;
        this.lastname = response.lastname;
        this.email = response.email;
        this.photo_url = response.url_photo;
        this.usuarios = [response];
      },
      error: (error) => {
        console.error('Error al obtener los usuarios:', error);
      }
    });
  }

  cambiarFoto(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      this.subirFoto(file).subscribe({
        next: (response: any) => {
          this.photo_url = response.photo_url; // Asigna la URL de la foto retornada por el servidor
          console.log('URL de la nueva foto:', this.photo_url);
        },
        error: (error) => {
          console.error('Error al subir la foto:', error);
        }
      });
    }
  }

  subirFoto(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token_usuario')
    });

    return this.httpClient.post('http://localhost:3000/api/upload', formData, { headers });
  }

  async guardarCambios() {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      console.error('El ID del usuario no está definido');
      Swal.fire(
        "Error",
        "El ID del usuario no está definido.",
        "error"
      );
      return;
    }

    const userDetailsActualizado: any = {
      name: this.name,
      lastname: this.lastname,
      email: this.email,
      photo_url: this.photo_url // Usar la nueva propiedad photo_url
    };

    if (this.cambiarpassword && this.newPassword) {
      userDetailsActualizado.password = this.newPassword;
    }
    console.log(userDetailsActualizado);

    try {
      await this.usersService.updateUser(userId, userDetailsActualizado);
      await this.router.navigate([`/account`]);
      console.log('Cambios guardados con éxito');
      Swal.fire(
        "Cambios Guardados",
        "Tus cambios han sido guardados con éxito.",
        "success"
      );
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      Swal.fire(
        "Error al Guardar",
        "Hubo un problema al guardar tus cambios.",
        "error"
      );
    }
}
}
