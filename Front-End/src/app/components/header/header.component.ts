import { Component, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { UsersService } from '../../core/services/users.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'] 
})
export class HeaderComponent implements AfterViewInit, OnDestroy {

  authService = inject(UsersService);
  router = inject(Router);
  id: number = 0;
  token: string = "";
  private tokenSubscription: Subscription;

  constructor() {
    // Obtener el ID del usuario del almacenamiento local
    this.id = parseInt(localStorage.getItem('id_user') || '0', 10);

    // Suscribirse a los cambios del token
    this.tokenSubscription = this.authService.token$.subscribe(token => {
      this.token = token;
    });
  }

  ngAfterViewInit(): void {
    this.addClickEventToNavLinks();
  }

  ngOnDestroy(): void {
    if (this.tokenSubscription) {
      this.tokenSubscription.unsubscribe();
    }
  }

  addClickEventToNavLinks(): void {
    const navLinks = document.querySelectorAll(".nav-li_a");
    
    if (navLinks.length > 0) {
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          const nav = document.querySelector(".nav");
          const menu_flotante = document.querySelector(".menu-flotante");
          if (menu_flotante && nav) {
            menu_flotante.classList.remove("hidden");
            nav.classList.remove("open");
          }
        });
      });
    } else {
      console.log("Elemento .nav-li_a no encontrado");
    }
  }

  addClassOpen(): void {
    const nav = document.querySelector(".nav");
    const menu_flotante = document.querySelector(".menu-flotante");
    nav?.classList.add("open");
    menu_flotante?.classList.add("hidden");
  }

  removeClassOpen(): void {
    const nav = document.querySelector(".nav");
    const menu_flotante = document.querySelector(".menu-flotante");
    menu_flotante?.classList.remove("hidden");
    nav?.classList.remove("open");
  }

  logout(): void {
    Swal.fire({
      title: '¿Realmente quieres salir?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: 'var(--danger)',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        Swal.fire({
          icon: 'success',
          title: '¡Cerrado!',
          text: 'Tu sesión ha sido cerrada.',
          confirmButtonColor: 'var(--primary)',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.router.navigate(['/welcome']);
        });
      }
    });
  }
}
