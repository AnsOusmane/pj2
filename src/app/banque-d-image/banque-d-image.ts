import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-banque-d-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banque-d-image.html',
  styleUrls: ['./banque-d-image.css']
})
export class BanqueDImageComponent {

  categories = ['Toutes', 'Evénements', 'Pharmacies', 'Santé', 'Projets', 'Divers'];
  activeCategory = 'Toutes';

  images = [
    { src: 'assets/bank/1.png', category: 'Evénements', title: 'Forum santé' },
    { src: 'assets/bank/2.png', category: 'Pharmacies', title: 'Partenariat' },
    { src: 'assets/bank/3.png', category: 'Santé', title: 'Vaccination' },
    { src: 'assets/bank/4.png', category: 'Projets', title: 'Extension' },
    { src: 'assets/bank/5.png', category: 'Divers', title: 'Journée mondiale' },
  ];

  lightboxImage: string | null = null;

  setCategory(cat: string) {
    this.activeCategory = cat;
  }

  openLightbox(img: string) {
    this.lightboxImage = img;
  }

  closeLightbox() {
    this.lightboxImage = null;
  }

  get filteredImages() {
    if (this.activeCategory === 'Toutes') return this.images;
    return this.images.filter(i => i.category === this.activeCategory);
  }
}
