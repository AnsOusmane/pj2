// src/app/media/media.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media.html',
  styleUrls: ['./media.css']
})
export class MediaComponent {
  activeTab = 'newsletters';
  selectedVideo: { embedUrl: SafeResourceUrl; title: string; description: string } | null = null;

  newsletters = [
    { title: "CSU Info - Édition #15", date: "10 Novembre 2025", excerpt: "Bilan des inscriptions nationales, nouveaux centres partenaires...", link: "#" },
    { title: "CSU Info - Édition #14", date: "15 Octobre 2025", excerpt: "Guide d'inscription en ligne : étape par étape.", link: "#" },
    { title: "CSU Info - Édition #13", date: "20 Septembre 2025", excerpt: "Témoignages de bénéficiaires dans les régions rurales.", link: "#" },
  ];

  videos = [
    { title: "Comment s'inscrire à la CSU ?", thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg", duration: "3:45", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", description: "Guide pas à pas pour s'inscrire en ligne ou en centre." },
    { title: "Les avantages de la CSU expliqués", thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg", duration: "5:12", embedUrl: "https://www.youtube.com/embed/9bZkp7q19f0", description: "Tout savoir sur les soins gratuits." },
    { title: "Témoignage : Awa, bénéficiaire à Thiès", thumbnail: "https://img.youtube.com/vi/3JZ_D3J4d1s/maxresdefault.jpg", duration: "2:30", embedUrl: "https://www.youtube.com/embed/3JZ_D3J4d1s", description: "Une mère de famille raconte son expérience." },
  ];

  temoignages = [
    { name: "Fatou Diop", location: "Dakar", photo: "https://randomuser.me/api/portraits/women/32.jpg", quote: "Grâce à la CSU, j'ai pu faire soigner mon fils sans payer un centime.", date: "5 Nov. 2025" },
    { name: "Moustapha Ndiaye", location: "Saint-Louis", photo: "https://randomuser.me/api/portraits/men/45.jpg", quote: "Avant, je reportais mes consultations. Aujourd'hui, je suis suivi.", date: "28 Oct. 2025" },
    { name: "Aminata Sow", location: "Kaolack", photo: "https://randomuser.me/api/portraits/women/68.jpg", quote: "La CSU m'a sauvée pendant ma grossesse.", date: "12 Oct. 2025" },
  ];

  constructor(private sanitizer: DomSanitizer) {}

  openVideoModal(video: any) {
    this.selectedVideo = {
      embedUrl: this.sanitizer.bypassSecurityTrustResourceUrl(video.embedUrl),
      title: video.title,
      description: video.description
    };
  }

  closeModal() {
    this.selectedVideo = null;
  }
}