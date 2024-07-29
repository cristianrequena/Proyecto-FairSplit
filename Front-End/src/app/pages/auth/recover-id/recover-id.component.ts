import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UsersService } from '../../../core/services/users.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recover-id',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './recover-id.component.html',
  styleUrls: ['./recover-id.component.css']
})
export class RecoverIdComponent implements OnInit {
  formRecoverPass: FormGroup;
  token: any | null = null;
  userId: string | null = null;
  newpassword = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private usersService: UsersService,
    private route: ActivatedRoute
  ) {
    this.formRecoverPass = this.formBuilder.group({
      newpassword: new FormControl('', [
        Validators.required,
        Validators.minLength(4)
      ])
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];
    this.userId = this.route.snapshot.queryParams['id'];
  }



  async onSubmit() {
    this.newpassword = this.formRecoverPass.get('newpassword')?.value;

    try {
      if (!this.userId || !this.newpassword || !this.token) {
        throw new Error('Faltan datos necesarios para actualizar la contraseña del usuario');
      }

      console.log('Calling usersService.updateUserPassword with:', this.userId, this.newpassword, this.token);
      await this.usersService.updateUserPassword(this.userId, this.newpassword, this.token);
      
      Swal.fire({
        icon: 'success',
        title: 'Contraseña actualizada',
        text: 'La contraseña ha sido actualizada con éxito.',
        confirmButtonColor: 'var(--primary)'
      });

      await this.router.navigate(['/welcome']);
      console.log('Cambios guardados con éxito');
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      this.errorMessage = 'Error al guardar los cambios. Por favor, intenta de nuevo.';
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar los cambios. Por favor, intenta de nuevo.',
        confirmButtonColor: 'var(--primary)'
      });
    }
  }
}
