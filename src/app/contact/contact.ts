import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="contact-section">
      <div class="contact-container">
        <h2 class="title animate-fade">Contactez-nous</h2>
        <p class="subtitle animate-fade-delay">
          Une question ? Une idée ? Écrivez-nous, nous vous répondrons rapidement.
        </p>

        <div class="contact-content">
          <!-- FORMULAIRE -->
          <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="contact-form animate-slide">
            <div class="form-group">
              <label>Nom complet</label>
              <input type="text" formControlName="name" placeholder="Votre nom" />
              <small *ngIf="submitted && contactForm.controls['name'].invalid">
                Nom requis (min. 2 caractères)
              </small>
            </div>

            <div class="form-group">
              <label>Email</label>
              <input type="email" formControlName="email" placeholder="Votre email" />
              <small *ngIf="submitted && contactForm.controls['email'].invalid">
                Email invalide
              </small>
            </div>

            <div class="form-group">
              <label>Sujet</label>
              <input type="text" formControlName="subject" placeholder="Sujet du message" />
              <small *ngIf="submitted && contactForm.controls['subject'].invalid">
                Sujet requis
              </small>
            </div>

            <div class="form-group">
              <label>Message</label>
              <textarea rows="5" formControlName="message" placeholder="Votre message..."></textarea>
              <small *ngIf="submitted && contactForm.controls['message'].invalid">
                Message trop court
              </small>
            </div>

            <button type="submit" class="send-btn">Envoyer</button>

            <p *ngIf="successMessage" class="success-msg animate-fade">
              {{ successMessage }}
            </p>
          </form>

          <!-- GOOGLE MAP -->
          <div class="map animate-slide-delay">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62048.10925070629!2d-17.4834779!3d14.6927786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec10b4d2c31c2fb%3A0x9f4a7b19302bcd4c!2sDakar!5e0!3m2!1sfr!2ssn!4v1709020834112!5m2!1sfr!2ssn"
              width="100%"
              height="100%"
              style="border:0;"
              allowfullscreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .contact-section {
      padding: 80px 20px;
      background: linear-gradient(135deg, #0d0d0d, #1e1e1e);
      color: #fff;
      font-family: 'Poppins', sans-serif;
    }

    .contact-container {
      max-width: 1100px;
      margin: auto;
      text-align: center;
    }

    .title {
      font-size: 2.5rem;
      font-weight: 700;
    }

    .subtitle {
      font-size: 1.1rem;
      margin-bottom: 40px;
      opacity: 0.8;
    }

    .contact-content {
      display: flex;
      flex-wrap: wrap;
      gap: 30px;
      justify-content: center;
    }

    .contact-form {
      flex: 1;
      min-width: 320px;
      max-width: 500px;
      background: #fff;
      color: #333;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    }

    .form-group {
      margin-bottom: 20px;
      text-align: left;
    }

    label {
      display: block;
      font-weight: 600;
      margin-bottom: 5px;
    }

    input, textarea {
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #ccc;
      transition: all 0.3s;
    }

    input:focus, textarea:focus {
      border-color: #ffcc00;
      outline: none;
    }

    small {
      color: red;
      font-size: 0.85rem;
    }

    .send-btn {
      width: 100%;
      background: #ffcc00;
      border: none;
      color: #000;
      font-weight: 700;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: 0.3s;
    }

    .send-btn:hover {
      background: #ffd633;
    }

    .success-msg {
      margin-top: 15px;
      color: #28a745;
      font-weight: 600;
    }

    .map {
      flex: 1;
      min-width: 320px;
      max-width: 500px;
      height: 400px;
      border-radius: 12px;
      overflow: hidden;
    }

    /* Animations */
    .animate-fade {
      opacity: 0;
      animation: fadeIn 1.5s ease forwards;
    }

    .animate-fade-delay {
      opacity: 0;
      animation: fadeIn 2s ease forwards;
      animation-delay: 0.5s;
    }

    .animate-slide {
      transform: translateY(40px);
      opacity: 0;
      animation: slideUp 1.2s ease forwards;
    }

    .animate-slide-delay {
      transform: translateY(40px);
      opacity: 0;
      animation: slideUp 1.2s ease forwards;
      animation-delay: 0.3s;
    }

    @keyframes fadeIn {
      to {
        opacity: 1;
      }
    }

    @keyframes slideUp {
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .contact-content {
        flex-direction: column;
      }
    }
  `]
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  submitted = false;
  successMessage = '';

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.contactForm.valid) {
      console.log(this.contactForm.value);
      this.successMessage = '✅ Votre message a été envoyé avec succès !';
      this.contactForm.reset();
      this.submitted = false;
    }
  }
}
