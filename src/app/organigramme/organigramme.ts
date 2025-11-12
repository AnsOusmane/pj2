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
    { nom: 'Dr Séga Gueye', poste: 'Directeur Général de la Sen CSU', photo: 'assets/team/1.jpg', bio: 'Directeur général depuis 2024...' },
    { nom: 'Matar Traoré', poste: 'Secrétaire Général', photo: 'assets/team/2.png', bio: 'Secrétaire générale...' },
    { nom: 'Aly Fall', poste: 'Directeur de la Com', photo: 'assets/team/3.jpg', bio: 'Directeur de la Communication...' },
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
