import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { IExpense } from '../interfaces/iexpense';
import { firstValueFrom } from 'rxjs';
import { IGroup } from '../interfaces/igroup';

@Injectable({
  providedIn: 'root'
})


export class GrupoGastosService {
  private baseUrl: string = `${environment.apiUrl}/gastos`;
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

  insert(expenseData: IExpense): Promise<IExpense> {
    return firstValueFrom(
      this.httpClient.post<IExpense>(this.baseUrl, expenseData, { headers: this.createHeaders() })
    ).catch((error: HttpErrorResponse) => {
      console.error('Error en la solicitud HTTP:', error.message, error.status, error.statusText, error.url);
      throw error;
    });
  }

  private usuarios: string[] = [];
  private gastos: { usuario: string, cantidad: number, descripcion: string }[] = [];

  agregarUsuario(nombre: string): void {
    if (!this.usuarios.includes(nombre)) {
      this.usuarios.push(nombre);
    } else {
      console.log(`El usuario ${nombre} ya existe.`);
    }
  }

  registrarGasto(usuario: string, cantidad: number, descripcion: string): void {
    if (!this.usuarios.includes(usuario)) {
      console.log(`El usuario ${usuario} no existe.`);
      return;
    }
    this.gastos.push({ usuario, cantidad, descripcion });
  }

  calcularGastosIndividuales(): { [key: string]: number } {
    const gastosIndividuales: { [key: string]: number } = {};

    this.usuarios.forEach(usuario => {
      gastosIndividuales[usuario] = 0;
    });

    this.gastos.forEach(gasto => {
      gastosIndividuales[gasto.usuario] += gasto.cantidad;
    });

    return gastosIndividuales;
  }

  calcularDeudas(): { [key: string]: number } {
    const totalGastos = this.gastos.reduce((sum, gasto) => sum + gasto.cantidad, 0);
    const gastoPorPersona = totalGastos / this.usuarios.length;
    const deudas: { [key: string]: number } = {};

    this.usuarios.forEach(usuario => {
      deudas[usuario] = 0;
    });

    this.gastos.forEach(gasto => {
      deudas[gasto.usuario] += gasto.cantidad;
    });

    this.usuarios.forEach(usuario => {
      deudas[usuario] -= gastoPorPersona;
    });

    return deudas;
  }

  calcularTransacciones() {
    const deudas = this.calcularDeudas();
    const acreedores = [];
    const deudores = [];

    for (const [usuario, deuda] of Object.entries(deudas)) {
      if (deuda > 0) {
        acreedores.push({ usuario, cantidad: deuda });
      } else if (deuda < 0) {
        deudores.push({ usuario, cantidad: -deuda });
      }
    }

    const transacciones = [];

    while (deudores.length > 0 && acreedores.length > 0) {
      const deudor = deudores[0];
      const acreedor = acreedores[0];

      const cantidad = Math.min(deudor.cantidad, acreedor.cantidad);

      transacciones.push({
        deudor: deudor.usuario,
        acreedor: acreedor.usuario,
        cantidad
      });

      deudor.cantidad -= cantidad;
      acreedor.cantidad -= cantidad;

      if (deudor.cantidad === 0) {
        deudores.shift();
      }
      if (acreedor.cantidad === 0) {
        acreedores.shift();
      }
    }

    return transacciones;
  }
}
