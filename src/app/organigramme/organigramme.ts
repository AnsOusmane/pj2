import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Membre {
  nom: string;
  poste: string;
  photo: string;
  bio: string;
}

@Component({
  selector: 'app-organigramme',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './organigramme.html',
  styleUrls: ['./organigramme.css']
})
export class OrganigrammeComponent {
  membres: Membre[] = [
    { nom: 'Dr Séga Gueye', poste: 'Directeur Général de la SEN-CSU', photo: 'assets/team/1.jpg', bio: 'Directeur général depuis 2024...' },
    { nom: 'Matar Traoré', poste: 'Secrétaire Général', photo: 'assets/team/2.png', bio: 'Secrétaire générale...' },
    { nom: 'Samba Diop', poste: 'RH', photo: 'assets/team/user.png', bio: 'Directeur des...' },
    { nom: 'Mor Fall', poste: 'Audit', photo: 'assets/team/user.png', bio: 'Directeur de l...' },
  ];

  currentIndex = 0;

  get currentMembre(): Membre {
    return this.membres[this.currentIndex];
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.membres.length;
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.membres.length) % this.membres.length;
  }
}
