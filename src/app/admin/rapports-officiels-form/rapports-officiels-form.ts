import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-rapports-officiels-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './rapports-officiels-form.html'
})
export class RapportsOfficielsFormComponent {
  rapport = {
    title: '',
    description: '',
    file: null as File | null
  };

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.rapport.file = file;
  }

  submit() {
    const formData = new FormData();
    formData.append('title', this.rapport.title);
    formData.append('description', this.rapport.description || '');
    if (this.rapport.file) {
      formData.append('file', this.rapport.file, this.rapport.file.name);
    }

    this.http.post('http://localhost:3000/api/rapports_officiels', formData)
      .subscribe({
        next: () => {
          alert('Rapport ajouté avec succès !');
          // Réinitialiser le formulaire
          this.rapport = { title: '', description: '', file: null };
          const fileInput = document.getElementById('fileInput') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        },
        error: (err) => {
          console.error(err);
          alert('Erreur à l\'ajout du rapport, voir console pour détails');
        }
      });
  }
}