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
  {
    title: "CSU - Inscription en ligne (Tutoriel complet)",
    thumbnail: "https://img.youtube.com/vi/2ZIXBCfPwRQ/maxresdefault.jpg",
    duration: "4:01",
    embedUrl: "https://www.youtube.com/watch?v=2ZIXBCfPwRQ",
    description: "Guide complet pour s'inscrire à la Couverture Santé Universelle."
  },
  {
    title: "Comment fonctionne la couverture santé universelle ?",
    thumbnail: "https://img.youtube.com/vi/Xo2-K_Cj0w0/maxresdefault.jpg",
    duration: "6:22",
    embedUrl: "https://www.youtube.com/watch?v=Xo2-K_Cj0w0",
    description: "Explication détaillée du système de CSU et de ses avantages."
  },
  {
    title: "CSU : Procédure d’enrôlement pas à pas",
    thumbnail: "https://img.youtube.com/vi/8O0JeT-zVx8/maxresdefault.jpg",
    duration: "3:55",
    embedUrl: "https://www.youtube.com/watch?v=8O0JeT-zVx8",
    description: "Un tutoriel clair sur le processus d'enrôlement."
  }
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