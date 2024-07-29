import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FriendsService} from '../../../../core/services/friends.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-new-friend',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './new-friend.component.html',
  styleUrl: './new-friend.component.css'
})
export class NewFriendComponent {
  formGroup: FormGroup;
  formBuilder = inject(FormBuilder);
  friendsService = inject(FriendsService)
  router = inject(Router)

  @Output() cerrar = new EventEmitter<void>();

  constructor() {
    this.formGroup = this.formBuilder.group({
      friend: [null, [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
    });
  }

  async onSubmit() {
    if (this.formGroup.valid) {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          throw new Error('User ID no encontrado en localStorage');
        }
        const friendEmail = this.formGroup.get('friend')?.value;
        const response = await this.friendsService.addFriend(Number(userId), friendEmail);
        console.log(response);
        this.cerrarPopup();

        Swal.fire(
          'Añadido correctamente.',
        ).then(() => {
          window.location.reload();
        });
      } catch (error) {
        console.error('Error añadiendo amigo:', error);
        this.cerrarPopup();
        Swal.fire({
          title: '¡Error!',
          text: 'Asegurate que el email está registrado',
          icon: 'error',
          confirmButtonColor: 'var(--primary)',
          confirmButtonText: 'Cerrar'
        });
      }
    } else {
      console.log('Formulario no válido');
    }
  }

  checkControl(formControlName: string, validador: string): boolean | undefined {
    return this.formGroup.get(formControlName)?.hasError(validador) && this.formGroup.get(formControlName)?.touched;
  }

  cerrarPopup(): void {
    this.cerrar.emit();
  }
}