import { Routes } from '@angular/router';
import { HeroComponent } from './hero/hero';
import { ProgrammeComponent } from './programme/programme';

export const routes: Routes = [
  { path: '', component: HeroComponent },
  { path: 'programme/:id', component: ProgrammeComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];