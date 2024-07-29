import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NewFriendComponent } from './components/new-friend/new-friend.component';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { IUser } from '../../core/interfaces/iuser';
import { FriendsService } from '../../core/services/friends.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, NewFriendComponent],
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent {
  friends: IUser[] = []

  friendsService = inject(FriendsService)
  activatedRoute = inject(ActivatedRoute)

  async ngOnInit(): Promise<void> {
    await this.loadFriends();
  }

  async loadFriends(): Promise<void> {
    try {
      const response = await this.friendsService.getAllFriend();
      this.friends = response;
      this.ordenarAlfabeticamente();
      console.log('Respuesta del servicio:', response);
    } catch (error: unknown) {
      console.error('Error al obtener amigos:', error);
      if (error instanceof HttpErrorResponse) {
        if (error.status === 403) {
          console.error('No tiene autorización para acceder a este recurso.');
        } else if (error.status === 204) {
          this.friends = [];
          console.log('No hay amigos asociados a este usuario.');
        }
      } else {
        console.error('Ocurrió un error inesperado:', error);
      }
    }
  }


  async deleteFriend(friend:IUser): Promise<void> {
    const result = await Swal.fire({
      title: `¿Realmente quieres eliminar a ${friend.name} ${friend.lastname}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--danger)',
      cancelButtonColor: 'var(--primary)',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await this.friendsService.deleteFriend(friend._id);
        console.log(response);
        console.log('Amigo eliminado correctamente');
        await this.loadFriends();
        Swal.fire(
          '¡Eliminado!',
          `${friend.name} ${friend.lastname} ha sido eliminado de tu lista de amigos`,
          'success'
        );
      } catch (error) {
        console.error('Error al eliminar amigo:', error);
        Swal.fire(
          'Error!',
          'Hubo un error al eliminar el amigo.',
          'error'
        );
      }
    }
  }

  
  ordenarAlfabeticamente() {
    this.friends.sort((a, b) => {
      const nameA = `${a.name} ${a.lastname}`.toLowerCase();
      const nameB = `${b.name} ${b.lastname}`.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }

  mostrarPopup = false;

  abrirPopup() {
    this.mostrarPopup = true;
  }

  cerrarPopup() {
    this.mostrarPopup = false;
  }
}
