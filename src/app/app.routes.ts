import { Routes } from '@angular/router';
import { HeroComponent } from './hero/hero';
import { ProgrammeComponent } from './programme/programme';

export const routes: Routes = [
  // Page d’accueil → HeroComponent
  { path: '', component: HeroComponent },

  // Page programme avec paramètre id
  { path: 'programme/:id', component: ProgrammeComponent },

  // Optionnel : redirection vers la page d’accueil si route inconnue
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
