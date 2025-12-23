import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-decrets-officiels-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './decrets-form.html'
})
export class DecretsOfficielsFormComponent {

  decret = {
    title: '',
    description: '',
    file: null as File | null
  };

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.decret.file = input.files[0];
    }
  }

submit() {
  if (!this.decret.title || !this.decret.file) {
    alert('Titre et fichier obligatoires');
    return;
  }

  const formData = new FormData();
  formData.append('title', this.decret.title);
  formData.append('description', this.decret.description || '');
  formData.append('file', this.decret.file, this.decret.file.name);

  this.http.post('http://localhost:3000/api/decrets_officiels', formData)
    .subscribe({
      next: () => {
        alert('Décret ajouté avec succès !');
        this.decret = { title: '', description: '', file: null };

        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: err => {
        console.error(err);
        alert('Erreur à l’ajout du décret');
      }
    });
}

}
