// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HeroComponent } from './hero/hero';
import { ProgrammeComponent } from './programme/programme';
import { MediaComponent } from './media/media';

export const routes: Routes = [
  { path: '', component: HeroComponent },           // Accueil
  { path: 'programme/:id', component: ProgrammeComponent },
  { path: 'media', component: MediaComponent },     // Page Médias
  { path: '**', redirectTo: '', pathMatch: 'full' } // 404
];