import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact-form.html',  
})
export class ContactFormComponent {

  submitted = false;
  loading = false;
  errorMsg: string | null = null;

  form = new FormGroup({
    message: new FormControl('', Validators.required),
    fullname: new FormControl('', Validators.required),   
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
  });

  private readonly WEB3FORMS_URL = 'https://api.web3forms.com/submit';
  private readonly ACCESS_KEY = '41427ced-4d84-4f59-abe5-86cdbe354d51';

  constructor(private http: HttpClient) {}

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = null;
    this.submitted = false;

    // Préparation des données au format attendu par Web3Forms
    const payload = {
      access_key: this.ACCESS_KEY,
      name: this.form.value.fullname || 'Anonyme',          // "name" est conventionnel
      email: this.form.value.email,
      phone: this.form.value.phone || '—',
      message: this.form.value.message,
      
      // Optionnels mais très recommandés
      subject: '📩 Nouveau message depuis le site - Sen-CSU',
      from_name: this.form.value.fullname || 'Visiteur',
      // replyto: this.form.value.email,                    // décommente si tu veux répondre directement
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    this.http.post<any>(this.WEB3FORMS_URL, payload, { headers })
      .subscribe({
        next: (response) => {
          if (response?.success) {
            this.submitted = true;
            this.form.reset();
            setTimeout(() => this.submitted = false, 5000); // message disparaît après 5s
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