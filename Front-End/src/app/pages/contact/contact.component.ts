import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../services/message.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  to = ''; 
  subject = '';
  text = '';

  constructor(private messageService: MessageService) {}

  onSubmit() {
    const formData = {
      to: this.to,
      subject: this.subject,
      text: this.text
    };
    
    this.messageService.sendMessage(formData).subscribe({
      next: (response) => {
        console.log('Mensaje enviado con éxito', response);
        Swal.fire(
          "Envío exitoso",
          "Tu mensaje ha sido enviado con éxito.",
          "success"
        );
      },
      error: (error) => {
        console.error('Error al enviar mensaje', error);
        Swal.fire(
          "Error",
          "Hubo un problema al enviar tu mensaje.",
          "error"
        );
      }
    });
  }
}
