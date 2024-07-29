import { Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { IGroup } from '../../core/interfaces/igroup';
import { GroupsService } from '../../core/services/groups.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { GestionGastosComponent } from './gestion-gastos/gestion-gastos.component';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [MatTabsModule, CommonModule, GestionGastosComponent],
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent {
  private groupService = inject(GroupsService);
  private activatedRouter = inject(ActivatedRoute);
  router = inject(Router);

  title = "";
  description = "";
  total_amount = 0;
  participantsUser: any[] = [];
  gastos: any[] = [];
  pagos: any[] = [];
  total_amount_user = 0;
  total_a_pagar = 0;
  balances: any[] = [];
  usuarioEncontrado = false;

  async ngOnInit(): Promise<void> {
    this.activatedRouter.params.subscribe(async (params: any) => {
      try {
        let responseGrupo = await this.groupService.getById(params.id);
        this.title = responseGrupo.title;
        this.description = responseGrupo.description;
        this.participantsUser = responseGrupo.participants;
        this.total_amount = responseGrupo.total_amount ?? 0;
        this.total_a_pagar = responseGrupo.total_a_pagar ?? 0;
        this.gastos = responseGrupo.gastos ?? [];
        this.pagos = responseGrupo.pagos ?? [];

        this.balances = this.calculateNetDebts(this.pagos);

        // Itera sobre cada participante
        this.participantsUser.forEach(element => {
          if (element.user_id == parseInt(localStorage.getItem('user_id') || '0', 10)) {
            this.usuarioEncontrado = true;
          }
        });

        // Verifica si el usuario fue encontrado
        if (!this.usuarioEncontrado) {
          // Si no fue encontrado, redirige al home
          this.router.navigate(['/home']);
        }

        console.log(this.balances);
      } catch (error) {
        console.error("Error fetching group data", error);
        this.router.navigate(['/home']);

      }
    });

  }

  calcularTotal(): number {
    return this.total_amount_user;
  }

  mostrarPopup = false;

  abrirPopup() {
    this.mostrarPopup = true;
  }

  cerrarPopup() {
    this.mostrarPopup = false;
  }

  // Función para obtener el nombre completo del usuario
  getUserName(userId: number): string {
    const user = this.participantsUser.find(participant => participant.user_id === userId);
    console.log(user);
    return user ? `${user.name} ${user.lastname}` : 'Unknown User';
  }

  // Función para calcular las deudas netas
  calculateNetDebts(payments: any[]): any[] {
    const debtsMap: any = {};

    payments.forEach(payment => {
      const payerId = payment.user_id_gasto;
      const receiverId = payment.user_id;
      const amount = parseFloat(payment.amount);

      if (!debtsMap[payerId]) {
        debtsMap[payerId] = {};
      }
      if (!debtsMap[receiverId]) {
        debtsMap[receiverId] = {};
      }

      if (!debtsMap[payerId][receiverId]) {
        debtsMap[payerId][receiverId] = 0;
      }
      if (!debtsMap[receiverId][payerId]) {
        debtsMap[receiverId][payerId] = 0;
      }

      debtsMap[payerId][receiverId] += amount;
    });

    const netDebts: any[] = [];

    Object.keys(debtsMap).forEach(payerId => {
      Object.keys(debtsMap[payerId]).forEach(receiverId => {
        if (debtsMap[payerId][receiverId] > 0) {
          const netAmount = debtsMap[payerId][receiverId] - debtsMap[receiverId][payerId];
          if (netAmount > 0) {
            netDebts.push({
              from: {
                id: payerId,
                name: this.getUserName(parseInt(payerId))
              },
              to: {
                id: receiverId,
                name: this.getUserName(parseInt(receiverId))
              },
              amount: netAmount.toFixed(2)
            });
          }
        }
      });
    });

    return netDebts;
  }
}
