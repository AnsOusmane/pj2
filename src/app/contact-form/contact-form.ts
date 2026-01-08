import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contact-form.html',
})
export class ContactFormComponent {

  submitted = false;
  loading = false;

  form = new FormGroup({
    message: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    console.log('Message envoyé :', this.form.value);

    // Simulation succès (backend plus tard)
    setTimeout(() => {
      this.loading = false;
      this.submitted = true;
      this.form.reset();

      setTimeout(() => this.submitted = false, 3000);
    }, 800);
  }
}
