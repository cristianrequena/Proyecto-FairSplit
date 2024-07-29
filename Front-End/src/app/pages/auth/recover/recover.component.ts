import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersService } from '../../../core/services/users.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recover',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.css']  // corrected from styleUrl to styleUrls
})
export class RecoverComponent {

  formRecover: FormGroup;

  formBuilder = inject(FormBuilder)
  usersService = inject(UsersService)
  router = inject(Router)
  activatedRoute = inject(ActivatedRoute)

  constructor() {
    this.formRecover = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),
        Validators.email
      ]),
    });
  }

  async onSubmit() {
    try {
      Swal.fire({
        title: 'Recuperación de contraseña',
        text: 'Si el correo está registrado en nuestra base de datos, se te mandará un correo para restablecer la contraseña.',
        icon: 'info',
        confirmButtonColor: 'var(--primary)'
      });

      const response = await this.usersService.recover(this.formRecover.value);
      console.log(response);
              
      this.router.navigateByUrl('/welcome');
    } catch (err: any) {
      console.log(err.error.error);
      
      Swal.fire({
        title: 'Error',
        text: 'Ha ocurrido un error al intentar recuperar la contraseña. Por favor, intenta de nuevo.',
        icon: 'error',
        confirmButtonColor: 'var(--primary)'
      });
    }
  }
}
