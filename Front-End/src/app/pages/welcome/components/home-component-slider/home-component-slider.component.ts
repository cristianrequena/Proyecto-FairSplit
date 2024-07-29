import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-component-slider',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home-component-slider.component.html',
  styleUrl: './home-component-slider.component.css'
})
export class HomeComponentSliderComponent {

  ngOnInit(): void {
    // Animaciones
    const span_palabras: any = document.querySelector(".palabras");
    const palabras = span_palabras.getAttribute("data-array");
    const palabras_array = palabras.split(",");

    let palabraIndex = 0;
    let letraIndex = 0;
    let forward = true;

    function escribirBorrar() {
      const palabra_actual = palabras_array[palabraIndex];
      const letras = palabra_actual.split("");

      if (forward) {
        // Escribir letra por letra
        if (letraIndex < letras.length) {
          span_palabras.innerHTML += letras[letraIndex];
          letraIndex++;
        } else {
          // Si se ha escrito la palabra completa, empezar a borrar después de un pequeño retraso
          forward = false;
          setTimeout(escribirBorrar, 1000);
          return;
        }
      } else {
        // Borrar letra por letra
        if (letraIndex > 0) {
          span_palabras.innerHTML = span_palabras.innerHTML.slice(0, -1);
          letraIndex--;
        } else {
          // Si se ha borrado la palabra completa, pasar a la siguiente palabra
          forward = true;
          palabraIndex = (palabraIndex + 1) % palabras_array.length;
        }
      }

      setTimeout(escribirBorrar, 200);
    }

    escribirBorrar();
  }


}


