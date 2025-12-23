import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-communiques-officiels-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './communiques-form.html'
})
export class communiquesOfficielsFormComponent {

  communiques = {
    title: '',
    description: '',
    file: null as File | null
  };

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.communiques.file = input.files[0];
    }
  }

submit() {
  if (!this.communiques.title || !this.communiques.file) {
    alert('Titre et fichier obligatoires');
    return;
  }

  const formData = new FormData();
  formData.append('title', this.communiques.title);
  formData.append('description', this.communiques.description || '');
  formData.append('file', this.communiques.file, this.communiques.file.name);

  this.http.post('http://localhost:3000/api/communiques_officiels', formData)
    .subscribe({
      next: () => {
        alert('communiqué ajouté avec succès !');
        this.communiques = { title: '', description: '', file: null };

        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: err => {
        console.error(err);
        alert('Erreur à l’ajout du communiques');
      }
    });
}

}
