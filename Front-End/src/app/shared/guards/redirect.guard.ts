import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const redirectGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token_usuario');

  if (token) {
    router.navigate(['/home']);
    return false;
  } else {
    return true;
  }
};
