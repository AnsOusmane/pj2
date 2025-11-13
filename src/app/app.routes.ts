import { Routes } from '@angular/router';
import { HeroComponent } from './hero/hero';
import { ProgrammeComponent } from './programme/programme';
import { AccueilsunuComponent } from './accueilsunu/accueilsunu';

export const routes: Routes = [
  { path: '', component: HeroComponent },
  { path: 'programme/:id', component: ProgrammeComponent },
  { path: '', component: AccueilsunuComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];