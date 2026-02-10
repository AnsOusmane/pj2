import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reclamation-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
<div class="font-exo2">
  <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-green-700 text-center mt-6 mb-10">
    Réclamation
  </h2>

  <div class="w-full bg-white lg:py-14 px-4">
    <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 px-6">

      <!-- COLONNE GAUCHE -->
      <div class="flex-1 max-w-[600px] text-gray-700 leading-relaxed text-lg">
        <p class="max-w-xl">
          Vous avez rencontré un problème avec les services de la
          <span class="font-semibold text-green-700">SEN-CSU&nbsp;?</span>
          Déposez votre réclamation ici et notre équipe vous répondra rapidement.
        </p>
        <img src="assets/logo.png" alt="Logo SEN-CSU" class="w-80 my-8">
        <div class="w-80 h-[2px] bg-green-700 my-6"></div>
        <h3 class="text-2xl font-semibold text-green-700 mb-4">Coordonnées de contact</h3>
        <div class="flex items-start gap-3 mb-5">
          <span class="text-green-600 text-2xl">📍</span>
          <a href="https://www.google.com/maps/place/Agence+de+la+CMU" target="_blank"
             class="text-green-700 hover:underline">
            Cité Keur Gorgui, Lot N°4, Immeuble El Hadji Serigne Mérina SYLLA<br>
            Dakar, Sénégal
          </a>
        </div>
        <div class="flex items-center gap-3 mb-5">
          <span class="text-green-600 text-2xl">📞</span>
          <a href="tel:+221338591515" class="text-green-700 hover:underline">
            +221 33 859 15 15
          </a>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-green-600 text-2xl">✉️</span>
          <a href="mailto:contact@agencecmu.sn" class="text-green-700 hover:underline">
            contact@agencecmu.sn
          </a>
        </div>
      </div>

      <!-- FORMULAIRE -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">

        <input type="text" formControlName="fullname" placeholder="Prénom et Nom *"
               class="w-full p-4 bg-white border border-gray-200 rounded-md" />
        <div *ngIf="hasError('fullname', 'required')" class="text-red-600 text-sm sm:col-span-2">
          Le nom complet est requis.
        </div>

        <input type="text" formControlName="city" placeholder="Ville *"
               class="w-full p-4 bg-white border border-gray-200 rounded-md" />
        <div *ngIf="hasError('city', 'required')" class="text-red-600 text-sm sm:col-span-2">
          La ville est requise.
        </div>

        <input type="text" formControlName="cardNumber" placeholder="Numéro de carte d’assuré (facultatif)"
               class="sm:col-span-2 w-full p-4 bg-white border border-gray-200 rounded-md" />

        <input type="tel" formControlName="phone" placeholder="Téléphone"
               class="w-full p-4 bg-white border border-gray-200 rounded-md" />

        <input type="email" formControlName="email" placeholder="Email (facultatif)"
               class="w-full p-4 bg-white border border-gray-200 rounded-md" />
        <div *ngIf="hasError('email', 'email')" class="text-red-600 text-sm sm:col-span-2">
          L’email saisi n’est pas valide.
        </div>

        <select formControlName="subject"
                [ngClass]="{'text-gray-400': !form.get('subject')?.value, 'text-black': form.get('subject')?.value}"
                class="sm:col-span-2 w-full p-4 bg-white border border-gray-200 rounded-md">
          <option value="" disabled selected hidden>Objet de la réclamation *</option>
          <option>Adhésion / Carte CSU</option>
          <option>Suivi / Prise en charge</option>
          <option>Autres</option>
        </select>
        <div *ngIf="hasError('subject', 'required')" class="sm:col-span-2 text-red-600 text-sm">
          L’objet de la réclamation est requis.
        </div>

        <input *ngIf="form.get('subject')?.value === 'Autres'"
               type="text" formControlName="customSubject"
               placeholder="Précisez l’objet *"
               class="sm:col-span-2 w-full p-4 bg-white border border-gray-200 rounded-md" />
        <div *ngIf="form.hasError('customRequired') && form.touched"
             class="sm:col-span-2 text-red-600 text-sm">
          Veuillez préciser l’objet quand « Autres » est choisi.
        </div>

        <textarea formControlName="message" rows="5" placeholder="Le message de votre réclamation *"
                  class="sm:col-span-2 w-full p-4 bg-white border border-gray-200 rounded-md resize-none"></textarea>
        <div *ngIf="hasError('message', 'required')" class="sm:col-span-2 text-red-600 text-sm">
          Le message est requis.
        </div>

        <button type="submit" 
                [disabled]="loading"
                class="sm:col-span-2 mt-6 bg-green-700 text-white py-3 px-6 rounded-md font-semibold hover:bg-green-800 transition duration-200 w-full md:w-auto">
          <span *ngIf="!loading">Envoyer la réclamation →</span>
          <span *ngIf="loading">Envoi en cours...</span>
        </button>

        <div *ngIf="submitted && !errorMsg" class="sm:col-span-2 mt-6 text-green-700 text-center font-medium">
          ✔️ Votre réclamation a bien été envoyée !
        </div>

        <div *ngIf="errorMsg" class="sm:col-span-2 mt-6 text-red-600 text-center font-medium">
          ❌ {{ errorMsg }}
        </div>

      </form>
    </div>
  </div>
</div>
  `,
})
export class ReclamationFormComponent {

  submitted = false;
  loading = false;
  errorMsg: string | null = null;
  showErrorSummary = false;

  form = new FormGroup({
    fullname:      new FormControl('', Validators.required),
    city:          new FormControl('', Validators.required),
    cardNumber:    new FormControl(''),
    phone:         new FormControl(''),
    email:         new FormControl('', Validators.email),
    subject:       new FormControl('', Validators.required),
    customSubject: new FormControl(''),
    message:       new FormControl('', Validators.required),
  }, { validators: [this.customSubjectValidator] });

  private readonly WEB3FORMS_URL = 'https://api.web3forms.com/submit';
  private readonly ACCESS_KEY = 'a3837e05-3557-4015-b3b1-12f93727837f';

  constructor(private http: HttpClient) {}

  // Validateur custom
  customSubjectValidator(group: AbstractControl): ValidationErrors | null {
    const subject = group.get('subject')?.value;
    const custom = group.get('customSubject')?.value?.trim() || '';
    if (subject === 'Autres' && custom.length === 0) {
      return { customRequired: true };
    }
    return null;
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = null;
    this.submitted = false;

    const finalSubject = this.form.value.subject === 'Autres'
      ? `Autres : ${this.form.value.customSubject?.trim() || 'non précisé'}`
      : this.form.value.subject;

    const now = new Date();
    const formattedDate = now.toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' });

    // ✅ Payload simplifié : tout extra dans message
    const payload = {
      access_key: this.ACCESS_KEY,
      name: this.form.value.fullname || 'Anonyme',
      email: this.form.value.email || 'non renseigné',
      message:
        `📌 Objet : ${finalSubject}\n` +
        `🕒 Date : ${formattedDate}\n` +
        `🏙️ Ville : ${this.form.value.city}\n` +
        `💳 N° Carte assuré : ${this.form.value.cardNumber || '—'}\n` +
        `📞 Téléphone : ${this.form.value.phone || '—'}\n\n` +
        `Message :\n${this.form.value.message || ''}`,
      subject: `⚠️ Nouvelle réclamation SEN-CSU - ${finalSubject}`,
      from_name: this.form.value.fullname || 'Visiteur'
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' });

    this.http.post<any>(this.WEB3FORMS_URL, payload, { headers }).subscribe({
      next: (response) => {
        if (response?.success) {
          this.submitted = true;
          this.form.reset();
          setTimeout(() => this.submitted = false, 7000);
        } else {
          this.errorMsg = response?.message || 'Erreur lors de l’envoi.';
        }
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur Web3Forms', err);
        this.loading = false;
        this.errorMsg = err.status === 0
          ? 'Problème de connexion. Vérifiez votre réseau.'
          : err.error?.message || 'Une erreur est survenue. Réessayez plus tard.';
      }
    });
  }
}
