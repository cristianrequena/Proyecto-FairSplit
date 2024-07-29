import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit, inject } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IGroup } from '../../../../core/interfaces/igroup';
import { GroupsService } from '../../../../core/services/groups.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-mini-group',
  standalone: true,
  imports: [RouterLink, CommonModule, MatSlideToggleModule, MatTooltipModule],
  templateUrl: './mini-group.component.html',
  styleUrls: ['./mini-group.component.css'] 
})
export class MiniGroupComponent {

  @Input() miGroup!: IGroup

  participants: number = 8;
  parent: number = 0;

  
  @Input() value: number = 50; 
  colors = [
    '#FFF5EE', '#FFF0F5', '#F8C8DC', '#FADADD', '#FFE4E1', '#FFDAB9', '#FAFAD2', '#F5DEB3', '#F0E68C', '#E6E6FA','#D8BFD8', '#D3D3D3', '#E0FFFF', '#E0EEE0', '#E3F2FD', '#A7D9C9', '#A2D2F2', '#B0E0E6', '#DCC6E0', '#DDA0DD','#FFB6C1', '#E6E6FA', '#FFFACD', '#FFE4E1', '#E0FFFF', '#F0E68C', '#F5DEB3', '#F8C8DC', '#FAFAD2'
]


  miniGroupColor!: string;
  addUserButtonColor!: string;
  progressBarColor!: string;

  groupService = inject(GroupsService)
  activatedRouter = inject(ActivatedRoute);


  async onDelete() {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        throw new Error('User ID no encontrado en localStorage');
      }
  
      if (userId === this.miGroup.creator_id?.toString()) {
        const firstConfirmation = await Swal.fire({
          title: '¿Estás seguro?',
          text: 'No podrás revertir esto.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: 'var(--danger)',
          cancelButtonColor: 'var(--primary)',
          confirmButtonText: 'Sí, eliminarlo',
          cancelButtonText: 'Cancelar'
        });
  
        if (firstConfirmation.isConfirmed) {
          const secondConfirmation = await Swal.fire({
            title: '¿Estás realmente seguro?',
            text: 'Se eliminaran todos los datos.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--danger)',
            cancelButtonColor: 'var(--primary)',
            confirmButtonText: 'Sí, eliminarlo definitivamente',
            cancelButtonText: 'Cancelar'
          });
  
          if (secondConfirmation.isConfirmed) {
            const response = await this.groupService.delete(this.miGroup.group_id.toString());
            console.log(response);
            Swal.fire({
              title: 'Eliminado correctamente.',
              icon: 'success',
              confirmButtonText: 'Cerrar',
              confirmButtonColor: 'var(--primary)',
            }).then(() => {
              window.location.reload();
            });
          }
        }
      } else {
        Swal.fire({
          title: '¡Error!',
          text: 'No eres el administrador del grupo.',
          icon: 'warning',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: 'var(--primary)',
        });
      }
    } catch (error) {
      console.error('Error eliminando grupo:', error);
  
      Swal.fire({
        title: '¡Error!',
        text: 'No se pudo eliminar el grupo.',
        icon: 'error',
        confirmButtonColor: 'var(--primary)',
        confirmButtonText: 'Cerrar'
      });
    }
  }

  getAbsoluteBalanceDifference(): number {
    return Math.abs(this.miGroup.balance_difference ?? 0);
  }

  onSelectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.parent = parseInt(selectElement.value, 10);
    console.log(this.parent);
  }

  async ngOnInit(): Promise<void> {
  
    this.miniGroupColor = this.getRandomColor();
    this.addUserButtonColor = this.getRandomColor();
  }

  getRandomColor(): string {
    const randomIndex = Math.floor(Math.random() * this.colors.length);
    return this.colors[randomIndex];
  }

  showPopup: boolean = false;

  onMouseEnter() {
    this.showPopup = true;
  }

  onMouseLeave() {
    this.showPopup = false;
  }
}
