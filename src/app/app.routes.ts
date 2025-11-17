// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HeroComponent } from './hero/hero';
import { ProgrammeComponent } from './programme/programme';
import { MediaComponent } from './media/media';
import { MissionsvisionComponent } from './missionsvision/missionsvision';
import { AccueilsunuComponent } from './accueilsunu/accueilsunu';
import { BanqueDImageComponent } from './banque-d-image/banque-d-image';


export const routes: Routes = [
  { path: '', component: HeroComponent }, 
  { path: 'programme/:id', component: ProgrammeComponent },
  { path: 'media', component: MediaComponent },    
  { path: 'missionsvision', component: MissionsvisionComponent },
  { path: '', component: AccueilsunuComponent },
  { path: 'banque-images', component: BanqueDImageComponent },



  { path: '**', redirectTo: '', pathMatch: 'full' }, // 404
];