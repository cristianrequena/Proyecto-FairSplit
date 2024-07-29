import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Swal from 'sweetalert2';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token_usuario');

  if (token) {
    return true;
  } else {
    Swal.fire({
      title: 'Tienes que estar autenticado.',
      icon: 'warning',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: 'var(--primary)',
    }).then(() => {
      router.navigate(['/login']);
    });
    return false;
  }
};
