import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

@Component({
  selector: 'app-reclamation-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reclamation-form.html',
})
export class ReclamationFormComponent {
  submitted = false;
  loading = false;
  errorMsg: string | null = null;
  showErrorSummary = false;

  form = new FormGroup({
    fullname: new FormControl<string>('', Validators.required),
    city: new FormControl<string>('', Validators.required),
    cardNumber: new FormControl<string>(''),
    phone: new FormControl<string>('', [
      Validators.required,
      this.phoneValidator.bind(this)
    ]),
    email: new FormControl<string>('', [Validators.email]),
    subject: new FormControl<string>('', Validators.required),
    customSubject: new FormControl<string>(''),
    message: new FormControl<string>('', Validators.required),
    // Honeypot anti-spam (laisser vide)
    _honey: new FormControl<string>(''),
  }, { validators: [this.customSubjectValidator] });

  private readonly FORMSUBMIT_URL = 'https://formsubmit.co/ajax/reclamation@agencecmu.sn';

  constructor(private http: HttpClient) {}

  phoneValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    let phoneNumber = parsePhoneNumberFromString(value);
    if (!phoneNumber || !phoneNumber.isValid()) {
      phoneNumber = parsePhoneNumberFromString(value, 'SN');
    }
    if (!phoneNumber || !phoneNumber.isValid()) {
      return { invalidPhone: true };
    }
    return null;
  }

  customSubjectValidator(group: AbstractControl): ValidationErrors | null {
    const subject = group.get('subject')?.value;
    const custom = group.get('customSubject')?.value?.trim?.() || '';
    if (subject === 'Autres' && custom.length === 0) {
      return { customRequired: true };
    }
    return null;
  }

  onSubmit(): void {
    this.showErrorSummary = false;
    this.form.updateValueAndValidity({ onlySelf: false, emitEvent: true });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showErrorSummary = true;
      return;
    }

    // Protection honeypot : si rempli → on arrête (bot probable)
    if (this.form.value._honey?.trim()) {
      console.warn('Honeypot rempli → probable spam, envoi annulé');
      this.errorMsg = 'Erreur inattendue. Veuillez réessayer.';
      return;
    }

    this.loading = true;
    this.errorMsg = null;
    this.submitted = false;

    // Normalisation téléphone international
    const phoneControl = this.form.get('phone');
    let phoneNumber = parsePhoneNumberFromString(phoneControl?.value || '');
    if (!phoneNumber || !phoneNumber.isValid()) {
      phoneNumber = parsePhoneNumberFromString(phoneControl?.value || '', 'SN');
    }
    if (phoneNumber) {
      phoneControl?.setValue(phoneNumber.number); // +221xxxxxxxxx
    }

    const finalSubject = this.form.value.subject === 'Autres'
      ? `Autres : ${this.form.value.customSubject?.trim() || 'non précisé'}`
      : this.form.value.subject || 'Non précisé';

    const now = new Date();
    const formattedDate = now.toLocaleString('fr-FR', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // Payload en objet simple (HttpClient le transformera en form-urlencoded)
    const payload: any = {
      fullname: this.form.value.fullname,
      email: this.form.value.email || 'Non renseigné',
      phone: this.form.value.phone,
      city: this.form.value.city,
      cardNumber: this.form.value.cardNumber || 'Non renseigné',
      _subject: `Nouvelle réclamation SEN-CSU - ${finalSubject}`,   // ← sujet email personnalisé
      message:
        `Objet : ${finalSubject}\n` +
        `Date d’envoi : ${formattedDate}\n` +
        `Ville : ${this.form.value.city}\n` +
        `N° Carte assuré : ${this.form.value.cardNumber || 'Non renseigné'}\n` +
        `Téléphone : ${this.form.value.phone}\n\n` +
        `Message :\n${this.form.value.message || ''}`,
      // Optionnel : si tu veux que le reply-to soit l'email du user
      _replyto: this.form.value.email || undefined,
      // Honeypot (déjà vérifié vide)
      _honey: this.form.value._honey,
      _captcha: 'false',
    };

    const headers = new HttpHeaders({
      'Accept': 'application/json'
      // Pas besoin de Content-Type: application/json → on laisse le défaut → x-www-form-urlencoded
    });

    this.http.post<any>(this.FORMSUBMIT_URL, payload, { headers, observe: 'response' }).subscribe({
      next: (response) => {
        // FormSubmit redirige souvent en succès → mais en AJAX on peut avoir 200
        this.submitted = true;
        this.form.reset();
        // Reset honeypot aussi
        this.form.get('_honey')?.setValue('');
        setTimeout(() => this.submitted = false, 7000);
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
  this.loading = false;
  console.error('Erreur FormSubmit complète :', err);
  console.log('Status:', err.status);
  console.log('Response body:', err.error);

  let msg = 'Problème serveur ou connexion. Réessayez plus tard.';
  if (err.status === 429) {
    msg = 'Trop de tentatives rapides. Attendez 1-2 minutes.';
  } else if (err.status === 403 || err.status === 400) {
    msg = 'Soumission bloquée (spam ou captcha ?). Essayez depuis un autre réseau.';
  } else if (err.error?.message) {
    msg = err.error.message;
  }
  this.errorMsg = msg;

      }
    });
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }
}