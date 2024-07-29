import { Component, NgModule } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MessageService } from './services/message.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HeaderComponent,FooterComponent, MatSlideToggleModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Front-End';

  constructor(public _MessageService: MessageService) {
  }
  contactForm(form: any) {
    this._MessageService.sendMessage(form.value).subscribe(() => {
      Swal.fire("Formulario de contacto", "Mensaje enviado correctamente", 'success');
    });
  }
}

@NgModule ({
  imports: [
    MatSlideToggleModule,
  ]
})
class AppModule {}
