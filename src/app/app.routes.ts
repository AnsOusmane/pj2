// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HeroComponent } from './hero/hero';
import { ProgrammeComponent } from './programme/programme';
import { MediaComponent } from './media/media';
import { MissionsvisionComponent } from './missionsvision/missionsvision';
import { AccueilsunuComponent } from './accueilsunu/accueilsunu';
import { BanqueDImageComponent } from './banque-d-image/banque-d-image';
import { CommuniquesPresseComponent } from './communiques-presse/communiques-presse';
import { RapportsOfficielsComponent } from './rapports-officiels/rapports-officiels';
import { Guide } from './guide/guide';
import { DecretsComponent } from './decrets/decrets';
import { ManuelAuditComponent } from './manuel-audit/manuel-audit';
import { ContactFormComponent } from './contact-form/contact-form'; 
import { NosServicesRegionauxComponent } from './nos-services-regionaux/nos-services-regionaux';
import { ZeroCinqAnsComponent } from './zero-cinq-ans/zero-cinq-ans';
import { PlanSesameComponent } from './plan-sesame/plan-sesame';
import { DialyseComponent } from './dialyse/dialyse';
import { CesarienneComponent } from './cesarienne/cesarienne';
import { AssuranceMaladieComponent } from './assurance-maladie/assurance-maladie';
import { AppelsOffreComponent } from './appels-offre/appels-offre';
import { CarriereComponent } from './carriere/carriere';

export const routes: Routes = [
  { path: '', component: HeroComponent }, 
  { path: 'programme/:id', component: ProgrammeComponent },
  { path: 'media', component: MediaComponent },    
  { path: 'missionsvision', component: MissionsvisionComponent },
  { path: '', component: AccueilsunuComponent },
  { path: 'banque-images', component: BanqueDImageComponent },
  { path: 'communiques-presse', component: CommuniquesPresseComponent },
  { path: 'rapports-officiels', component: RapportsOfficielsComponent },
  { path: 'guide', component: Guide },
  { path: 'decrets', component: DecretsComponent },
  { path: 'manuel-d-audit', component: ManuelAuditComponent },
  { path: 'contact', component: ContactFormComponent },
  { path: 'nos-services-regionaux', component: NosServicesRegionauxComponent },
  { path: 'zero-cinq-ans', component: ZeroCinqAnsComponent },
  { path: 'plan-sesame', component: PlanSesameComponent },
  { path: 'dialyse', component: DialyseComponent },
  { path: 'cesarienne', component: CesarienneComponent },
  { path: 'assurance-maladie', component: AssuranceMaladieComponent },
  { path: 'appels-offre', component: AppelsOffreComponent },
  { path: 'carriere', component: CarriereComponent },

  { path: '**', redirectTo: '', pathMatch: 'full' }, // 404
];