// import { Component } from '@angular/core';
// import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
// import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-contact-form',
//   standalone: true,
//   imports: [ReactiveFormsModule, CommonModule],
//   templateUrl: './contact-form.html',
// })
// export class ContactFormComponent {

//   submitted = false;
//   loading = false;
//   errorMsg: string | null = null;

//   form = new FormGroup({
//     message: new FormControl('', Validators.required),
//     fullname : new FormControl('', Validators.required),
//     email: new FormControl('', [Validators.required, Validators.email]),
//     phone: new FormControl(''),
//   });

//   constructor(private http: HttpClient) {}

//   onSubmit() {
//     // Si formulaire invalide
//     if (this.form.invalid) {
//       this.form.markAllAsTouched();
//       return;
//     }

//     this.loading = true;
//     this.errorMsg = null;

//     // POST vers ton backend contact-api
//     this.http.post('http://localhost:3000/api/contact', this.form.value)
//       .subscribe({
//         next: () => {
//           this.loading = false;
//           this.submitted = true;
//           this.form.reset();

//           setTimeout(() => this.submitted = false, 3000);
//         },
//         error: (err: HttpErrorResponse) => {
//           this.loading = false;
//           console.error('Erreur envoi message', err);
//           this.errorMsg = err.error?.message || 'Erreur lors de l’envoi, réessayez.';
//         }
//       });
//   }

//   // Méthode helper pour afficher erreurs de validation
//   hasError(controlName: string, errorName: string) {
//     const control = this.form.get(controlName);
//     return control && control.touched && control.hasError(errorName);
//   }
// }
