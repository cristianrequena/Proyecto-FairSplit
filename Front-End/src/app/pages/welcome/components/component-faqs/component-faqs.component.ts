import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-component-faqs',
  standalone: true,
  imports: [],
  templateUrl: './component-faqs.component.html',
  styleUrl: './component-faqs.component.css'
})
export class ComponentFaqsComponent implements OnInit {
  faqs = [
    { question: 'What is your return policy?', answer: 'Our return policy allows for returns within 30 days of purchase with a receipt.' },
    { question: 'How do I track my order?', answer: 'You can track your order using the tracking number provided in your confirmation email.' },
    { question: 'Do you offer international shipping?', answer: 'Yes, we offer international shipping to select countries. Please check our shipping policy for more details.' }
  ];

  ngOnInit(): void {
    const faq = document.querySelectorAll(".accordion-header");

    faq.forEach(header => {
      header.addEventListener('click', function () {
        const item: any = header.parentElement;
        item.classList.toggle('active');
      });
    });
  }
}
