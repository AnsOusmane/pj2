// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HeroComponent } from './hero/hero';
import { ProgrammeComponent } from './programme/programme';
import { MediaComponent } from './media/media';
import { MissionsvisionComponent } from './missionsvision/missionsvision';
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
import { AdminComponent } from './admin/admin';
// import { ActualitesComponent } from './pages/actualites/actualites';
import { RapportsOfficielsFormComponent } from './admin/rapports-officiels-form/rapports-officiels-form';

export const routes: Routes = [
  { path: '', component: HeroComponent }, 
  { path: 'programme/:id', component: ProgrammeComponent },
  { path: 'media', component: MediaComponent },    
  { path: 'missionsvision', component: MissionsvisionComponent },
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
  { path: 'admin', component: AdminComponent },
  // { path: 'actualites', component: ActualitesComponent },
  // { path: 'pages/actualites', component: ActualitesComponent },
  { path: 'admin/rapports-officiels-form', component: RapportsOfficielsFormComponent },
//{
//   path: 'actus',
//   loadComponent: () =>
//     import('./actus/actus-page').then(m => m.ActusPageComponent)
// },
// {
//   path: 'actus/:id',
//   loadComponent: () =>
//     import('./actus/actus-detail').then(m => m.ActuDetailComponent)
// }

  { path: '**', redirectTo: '', pathMatch: 'full' }, // 404
];