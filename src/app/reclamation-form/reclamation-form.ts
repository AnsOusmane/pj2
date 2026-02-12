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

    // ✅ TELEPHONE VERSION PRO
    phone: new FormControl<string>('', [
      Validators.required,
      this.phoneValidator.bind(this)
    ]),

    email: new FormControl<string>('', [Validators.email]),
    subject: new FormControl<string>('', Validators.required),
    customSubject: new FormControl<string>(''),
    message: new FormControl<string>('', Validators.required),
  }, { validators: [this.customSubjectValidator] });

  private readonly WEB3FORMS_URL = 'https://api.web3forms.com/submit';
  private readonly ACCESS_KEY = '394cea44-eda3-4c7a-91bc-b4b6dfa540a1';

  constructor(private http: HttpClient) {}

  /* =====================================================
     VALIDATION TELEPHONE PRO
     - International
     - National Sénégal
  ====================================================== */

  phoneValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) return null;

    // 1️⃣ Tentative internationale directe
    let phoneNumber = parsePhoneNumberFromString(value);

    // 2️⃣ Si invalide → on suppose Sénégal par défaut
    if (!phoneNumber || !phoneNumber.isValid()) {
      phoneNumber = parsePhoneNumberFromString(value, 'SN');
    }

    if (!phoneNumber || !phoneNumber.isValid()) {
      return { invalidPhone: true };
    }

    return null;
  }

  /* =====================================================
     VALIDATION SUJET PERSONNALISÉ
  ====================================================== */

  customSubjectValidator(group: AbstractControl): ValidationErrors | null {
    const subject = group.get('subject')?.value;
    const custom = group.get('customSubject')?.value?.trim?.() || '';

    if (subject === 'Autres' && custom.length === 0) {
      return { customRequired: true };
    }
    return null;
  }

  /* =====================================================
     SUBMIT
  ====================================================== */

  onSubmit(): void {

    this.showErrorSummary = false;
    this.form.updateValueAndValidity({ onlySelf: false, emitEvent: true });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showErrorSummary = true;
      return;
    }

    this.loading = true;
    this.errorMsg = null;
    this.submitted = false;

    /* ✅ NORMALISATION EN FORMAT INTERNATIONAL */
    const phoneControl = this.form.get('phone');

    let phoneNumber = parsePhoneNumberFromString(phoneControl?.value || '');

    if (!phoneNumber || !phoneNumber.isValid()) {
      phoneNumber = parsePhoneNumberFromString(phoneControl?.value || '', 'SN');
    }

    if (phoneNumber) {
      phoneControl?.setValue(phoneNumber.number); // ex: +221777777777
    }

    const finalSubject = this.form.value.subject === 'Autres'
      ? `Autres : ${this.form.value.customSubject?.trim() || 'non précisé'}`
      : this.form.value.subject || 'Non précisé';

    const now = new Date();
    const formattedDate = now.toLocaleString('fr-FR', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const payload = {
      access_key: this.ACCESS_KEY,
      name: this.form.value.fullname,
      email: this.form.value.email || 'Non renseigné',
      phone: this.form.value.phone,
      subject: `⚠️ Nouvelle réclamation SEN-CSU - ${finalSubject}`,
      message:
        `📌 Objet : ${finalSubject}\n` +
        `🕒 Date d’envoi : ${formattedDate}\n` +
        `🏙️ Ville : ${this.form.value.city}\n` +
        `💳 N° Carte assuré : ${this.form.value.cardNumber || 'Non renseigné'}\n` +
        `📞 Téléphone : ${this.form.value.phone}\n\n` +
        `Message :\n${this.form.value.message || ''}`,
      from_name: this.form.value.fullname,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    this.http.post<any>(this.WEB3FORMS_URL, payload, { headers }).subscribe({
      next: (response) => {
        if (response?.success) {
          this.submitted = true;
          this.form.reset();
          setTimeout(() => this.submitted = false, 7000);
        } else {
          this.errorMsg = response?.message || 'Erreur lors de l’envoi de la réclamation.';
        }
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        console.error('Erreur Web3Forms:', err);
        this.errorMsg = err.status === 0
          ? 'Problème de connexion. Vérifiez votre réseau internet.'
          : err.error?.message || 'Une erreur inattendue est survenue. Réessayez plus tard.';
      }
    });
  }

  /* =====================================================
     HELPER
  ====================================================== */

  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }
}
