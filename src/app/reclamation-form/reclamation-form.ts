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
  showErrorSummary = false;

  form = new FormGroup({
    fullname:      new FormControl<string>('', Validators.required),
    city:          new FormControl<string>('', Validators.required),
    cardNumber:    new FormControl<string>(''),
    phone:         new FormControl<string>('', Validators.required),
    email:         new FormControl<string>('', Validators.email),
    subject:       new FormControl<string>('', Validators.required),
    customSubject: new FormControl<string>(''),
    message:       new FormControl<string>('', Validators.required),
  }, { validators: [this.customSubjectValidator] });

  private readonly WEB3FORMS_URL = 'https://api.web3forms.com/submit';
  private readonly ACCESS_KEY = 'a3837e05-3557-4015-b3b1-12f93727837f';

  constructor(private http: HttpClient) {}

  // Validateur : si sujet = "Autres", customSubject doit être rempli
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

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showErrorSummary = true;
      return;
    }

    this.loading = true;
    this.errorMsg = null;
    this.submitted = false;

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
        `💳 N° Carte assuré : ${this.form.value.cardNumber || 'Non renseigné'}\n\n` +
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

  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }
}
