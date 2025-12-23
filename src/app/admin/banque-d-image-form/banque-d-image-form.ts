import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-banque-image-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './banque-d-image-form.html'
})
export class BanqueImagesFormComponent {

  banque_image = {
    title: '',
    description: '',
    alt_text: '',
    category: '',
    status: 'active',
    file: null as File | null
  };

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.banque_image.file = file;
    }
  }

  submit() {
    if (!this.banque_image.file) {
      alert('Veuillez sélectionner une image');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.banque_image.title);
    formData.append('description', this.banque_image.description || '');
    formData.append('alt_text', this.banque_image.alt_text || '');
    formData.append('category', this.banque_image.category || '');
    formData.append('status', this.banque_image.status);
    formData.append('file', this.banque_image.file);

    this.http.post('http://localhost:3000/api/banque_images', formData)
      .subscribe({
        next: () => {
          alert('Image ajoutée avec succès');
          this.resetForm();
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de l’ajout');
        }
      });
  }

  resetForm() {
    this.banque_image = {
      title: '',
      description: '',
      alt_text: '',
      category: '',
      status: 'active',
      file: null
    };

    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}
