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

  form = new FormGroup({
    subject: new FormControl('', Validators.required),
    customSubject: new FormControl(''),
    message: new FormControl('', Validators.required),
    fullname: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    cardNumber: new FormControl(''),                    // ← plus de Validators.required
    email: new FormControl('', Validators.email),
    phone: new FormControl('', Validators.required),
  }, {
    validators: [this.customSubjectValidator]
  });

  private readonly WEB3FORMS_URL = 'https://api.web3forms.com/submit';
  private readonly ACCESS_KEY = 'a3837e05-3557-4015-b3b1-12f93727837f';

  constructor(private http: HttpClient) {}

  /** Si "Autres", précision obligatoire */
  customSubjectValidator(group: AbstractControl): ValidationErrors | null {
    const subject = group.get('subject')?.value;
    const custom = group.get('customSubject')?.value;
    if (subject === 'Autres' && !custom?.trim()) {
      return { customRequired: true };
    }
    return null;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = null;
    this.submitted = false;

    const finalSubject =
      this.form.value.subject === 'Autres'
        ? `Autres : ${this.form.value.customSubject?.trim()}`
        : this.form.value.subject;

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
      message:
        `📌 Objet : ${finalSubject}\n` +
        `🕒 Date d’envoi : ${formattedDate}\n` +
        `🏙️ Ville : ${this.form.value.city}\n` +
        `💳 N° Carte assuré : ${this.form.value.cardNumber || 'Non renseigné'}\n\n` +
        `${this.form.value.message}`,
      subject: `⚠️ Nouvelle réclamation - ${finalSubject}`,
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
          setTimeout(() => (this.submitted = false), 6000);
        } else {
          this.errorMsg = response?.message || 'Erreur lors de l’envoi.';
        }
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        console.error('Erreur Web3Forms', err);
        if (err.status === 0) {
          this.errorMsg = 'Problème de connexion. Vérifiez votre réseau.';
        } else {
          this.errorMsg = err.error?.message || 'Une erreur est survenue. Réessayez plus tard.';
        }
      }
    });
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }
}