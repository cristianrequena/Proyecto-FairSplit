import { Component, EventEmitter, Output, inject } from '@angular/core';
import { GrupoGastosService } from '../../../core/services/grupo-gastos.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IExpense } from '../../../core/interfaces/iexpense';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UsersService } from '../../../core/services/users.service';
import { GroupsService } from '../../../core/services/groups.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-gastos',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, MatSelectionList, MatListModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './gestion-gastos.component.html',
  styleUrls: ['./gestion-gastos.component.css'],
})
export class GestionGastosComponent {
  formExpense: FormGroup;

  formBuilder = inject(FormBuilder);
  usersService = inject(UsersService);
  groupsService = inject(GroupsService);
  grupoGastosService = inject(GrupoGastosService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  participants: string[] = [];
  allMembers: { _id: string, fullName: string }[] = [];
  groupId: string = '';
  parent: string = '1';

  @Output() cerrar = new EventEmitter<void>();

  constructor() {
    this.formExpense = this.formBuilder.group({
      groupId: [null, Validators.required],
      user: [null, Validators.required],
      expense: [null, [Validators.required]],
      description: [null, [Validators.required, Validators.minLength(2)]],
      integrants: [[], Validators.required],
    });
  }

  async ngOnInit(): Promise<void> {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    this.formExpense.patchValue({ groupId: this.groupId });

    try {
      const response = await this.groupsService.getById(this.groupId);
      this.participants = response.participants;
      console.log('Respuesta del servicio:', this.participants);
      this.allMembers = this.participants.map((participant: any) => {
        return {
          _id: participant.user_id,
          fullName: `${participant.name} ${participant.lastname}`,
          ...participant,
        };
      });

    } catch (error: unknown) {
      console.error('Error al obtener grupos:', error);
      if (error instanceof HttpErrorResponse) {
        if (error.status === 403) {
          console.error('No tiene autorización para acceder a este recurso.');
        } else if (error.status === 204) {
          this.allMembers = [];
          console.log('No hay grupos asociados a este usuario.');
        }
      } else {
        console.error('Ocurrió un error inesperado:', error);
      }
    }
  }

  async onSubmit() {
    console.log('Valor del formulario antes de enviar:', this.formExpense.value);
    
    let participants: { id: string; percentage: number }[] = [];
    
    if (this.parent === '2') {
      const inputs = document.querySelectorAll('.member-input');
      let total = 0;
      
      inputs.forEach((element) => {
        const inputElement = element as HTMLInputElement;
        const id = inputElement.id;
        const value = Number(inputElement.value);
        total += value;
        participants.push({ id, percentage: value });
      });
      
      if (total !== 100) {
        alert('La suma de todos los porcentajes debe ser exactamente 100%.');
        return;
      }
    } else {
      participants = this.formExpense.get('integrants')?.value.map((id: string) => ({ id, percentage: 0 })) || [];
    }
    
    this.formExpense.patchValue({ integrants: participants });

    if (this.formExpense.valid) {
      const expenseData: IExpense = {
        expense_id: '',
        user_id_gasto: this.formExpense.get('user')?.value,
        amount: this.formExpense.get('expense')?.value,
        description: this.formExpense.get('description')?.value,
        group_id: this.formExpense.get('groupId')?.value,
        participants
      };

      console.log('Datos del gasto a enviar:', expenseData);

      try {
        const response = await this.grupoGastosService.insert(expenseData);
        if (response.expense_id) {
          this.cerrarPopup();
          Swal.fire({
            title: 'El gasto se ha añadido correctamente',
            icon: 'success',
            confirmButtonColor: 'var(--primary)',
          }).then(() => {
            window.location.reload();
          });
        } else {
          this.cerrarPopup();
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema, intentalo de nuevo',
            icon: 'error',
            confirmButtonColor: 'var(--primary)'
          });
        }
      } catch (error) {
        console.error('Error al crear el gasto:', error);
      
        if (error instanceof HttpErrorResponse) {
          console.error('Detalles del error:', error.message, error.status, error.statusText, error.url);
        } else {
          console.error('Error desconocido:', error);
        }
        this.cerrarPopup();
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema, intentalo de nuevo',
          icon: 'error',
          confirmButtonColor: 'var(--primary)'
        });
      }
      } else {
        this.cerrarPopup();
        Swal.fire({
          title: 'Atención',
          text: 'Por favor, completa todos los campos requeridos.',
          icon: 'warning',
          confirmButtonColor: 'var(--primary)',
        });
      }
    }

 
  onSelectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.parent = selectElement.value;
    console.log(this.parent);
  }

  validateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    const inputs = document.querySelectorAll('.member-input');
    let total = 0;

    inputs.forEach((element) => {
      const inputElement = element as HTMLInputElement;
      if (inputElement !== input) {
        total += Number(inputElement.value);
      }
    });

    if (value > 100) {
      input.value = '100';
    } else if (value < 0) {
      input.value = '0';
    } else {
      const currentTotal = total + value;
      if (currentTotal > 100) {
        input.value = (100 - total).toString();
      }
    }
  }

  checkControl(formControlName: string, validador: string): boolean | undefined {
    return this.formExpense.get(formControlName)?.hasError(validador) && this.formExpense.get(formControlName)?.touched;
  }

  cerrarPopup(): void {
    this.cerrar.emit();
  }
}
