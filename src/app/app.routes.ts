import { Routes } from '@angular/router';
import { appelsOffreGuard } from './guards/appels-offre.guard';

// NB : tous les composants sont chargés en lazy (`loadComponent`) afin de les
// sortir du bundle initial. Chaque route ne télécharge son code qu'à la visite.
//
// L'administration (/admin) et la connexion (/login) ont été extraites dans
// une application Angular séparée (admin-app/), déployée indépendamment —
// voir le plan de séparation admin. Ce front public ne sert plus que le
// contenu public.

export const routes: Routes = [
  // ====================== ROUTES PUBLIQUES ======================
  // `title` : géré nativement par Angular Router (document.title).
  // `data.description` : lu par SeoService (app.ts) pour la meta description.
  {
    path: '', loadComponent: () => import('./hero/hero').then(m => m.HeroComponent),
    title: 'Sen-CSU — Couverture Sanitaire Universelle du Sénégal',
    data: { description: "Agence de la Couverture Sanitaire Universelle du Sénégal : programmes de santé, marchés publics, actualités et services aux citoyens." }
  },
  {
    path: 'programme/:id', loadComponent: () => import('./programme/programme').then(m => m.ProgrammeComponent),
    title: 'Programme de santé — Sen-CSU',
    data: { description: "Découvrez les programmes de santé de la Couverture Sanitaire Universelle (CSU) au Sénégal." }
  },
  {
    path: 'media', loadComponent: () => import('./media/media').then(m => m.MediaComponent),
    title: 'Actualités & Médias — Sen-CSU',
    data: { description: "Actualités, newsletters, vidéos et témoignages de l'Agence de la Couverture Sanitaire Universelle (Sen-CSU)." }
  },
  {
    path: 'missionsvision', loadComponent: () => import('./missionsvision/missionsvision').then(m => m.MissionsvisionComponent),
    title: 'Missions & Vision — Sen-CSU',
    data: { description: "Missions et vision de l'Agence de la Couverture Sanitaire Universelle (Sen-CSU)." }
  },
  {
    path: 'banque-images', loadComponent: () => import('./banque-d-image/banque-d-image').then(m => m.BanqueDImageComponent),
    title: "Banque d'images — Sen-CSU",
    data: { description: "Banque d'images de l'Agence de la Couverture Sanitaire Universelle (Sen-CSU)." }
  },
  {
    path: 'communiques-presse', loadComponent: () => import('./communiques-presse/communiques-presse').then(m => m.CommuniquesPresseComponent),
    title: 'Communiqués de presse — Sen-CSU',
    data: { description: "Communiqués de presse officiels de l'Agence de la Couverture Sanitaire Universelle (Sen-CSU)." }
  },
  {
    path: 'rapports-officiels', loadComponent: () => import('./rapports-officiels/rapports-officiels').then(m => m.RapportsOfficielsComponent),
    title: 'Rapports officiels — Sen-CSU',
    data: { description: "Rapports officiels et documents institutionnels de la Sen-CSU." }
  },
  {
    path: 'guide', loadComponent: () => import('./guide/guide').then(m => m.Guide),
    title: 'Guides pratiques — Sen-CSU',
    data: { description: "Guides pratiques pour comprendre et bénéficier de la Couverture Sanitaire Universelle au Sénégal." }
  },
  {
    path: 'decrets', loadComponent: () => import('./decrets/decrets').then(m => m.DecretsComponent),
    title: 'Décrets — Sen-CSU',
    data: { description: "Décrets et textes réglementaires relatifs à la Couverture Sanitaire Universelle au Sénégal." }
  },
  {
    path: 'manuel-d-audit', loadComponent: () => import('./manuel-audit/manuel-audit').then(m => m.ManuelAuditComponent),
    title: "Manuels d'audit — Sen-CSU",
    data: { description: "Manuels d'audit de la Couverture Sanitaire Universelle (Sen-CSU)." }
  },
  {
    path: 'contact', loadComponent: () => import('./contact-form/contact-form').then(m => m.ContactFormComponent),
    title: 'Contact — Sen-CSU',
    data: { description: "Contactez l'Agence de la Couverture Sanitaire Universelle (Sen-CSU)." }
  },
  {
    path: 'nos-services-regionaux', loadComponent: () => import('./nos-services-regionaux/nos-services-regionaux').then(m => m.NosServicesRegionauxComponent),
    title: 'Services régionaux — Sen-CSU',
    data: { description: "Services régionaux de la Couverture Sanitaire Universelle sur tout le territoire sénégalais." }
  },
  {
    path: 'zero-cinq-ans', loadComponent: () => import('./zero-cinq-ans/zero-cinq-ans').then(m => m.ZeroCinqAnsComponent),
    title: 'Santé des 0-5 ans — Sen-CSU',
    data: { description: "Programme de santé gratuit pour les enfants de 0 à 5 ans au Sénégal (Sen-CSU)." }
  },
  {
    path: 'plan-sesame', loadComponent: () => import('./plan-sesame/plan-sesame').then(m => m.PlanSesameComponent),
    title: 'Plan Sésame — Sen-CSU',
    data: { description: "Plan Sésame : prise en charge santé des personnes âgées au Sénégal." }
  },
  {
    path: 'dialyse', loadComponent: () => import('./dialyse/dialyse').then(m => m.DialyseComponent),
    title: 'Dialyse — Sen-CSU',
    data: { description: "Prise en charge gratuite de la dialyse pour les patients atteints d'insuffisance rénale au Sénégal." }
  },
  {
    path: 'cesarienne', loadComponent: () => import('./cesarienne/cesarienne').then(m => m.CesarienneComponent),
    title: 'Césarienne gratuite — Sen-CSU',
    data: { description: "Gratuité de la césarienne pour les femmes enceintes au Sénégal." }
  },
  {
    path: 'assurance-maladie', loadComponent: () => import('./assurance-maladie/assurance-maladie').then(m => m.AssuranceMaladieComponent),
    title: 'Assurance maladie universelle — Sen-CSU',
    data: { description: "Assurance maladie universelle (CSU) : adhésion, cotisations et prise en charge des soins au Sénégal." }
  },
  {
    path: 'appels-offre', loadComponent: () => import('./marches-publics/marches-publics').then(m => m.MarchesPublicsComponent),
    canActivate: [appelsOffreGuard],
    title: 'Marchés publics — Sen-CSU',
    data: { description: "Marchés publics de la Sen-CSU : plan de passation, appels d'offres, avis d'attribution et agrément fournisseurs." }
  },
  {
    path: 'appels-offre/ppm', loadComponent: () => import('./ppm-public/ppm-public').then(m => m.PpmPublicComponent),
    canActivate: [appelsOffreGuard],
    title: 'Plan de passation des marchés — Sen-CSU',
    data: { description: "Plan de passation des marchés (PPM) de la Sen-CSU." }
  },
  {
    path: 'appels-offre/avis', loadComponent: () => import('./appels-offre/appels-offre').then(m => m.AppelsOffreComponent),
    canActivate: [appelsOffreGuard],
    title: "Appels d'offres — Sen-CSU",
    data: { description: "Appels d'offres en cours de la Sen-CSU." }
  },
  {
    path: 'appels-offre/attributions', loadComponent: () => import('./avis-attribution/avis-attribution').then(m => m.AvisAttributionComponent),
    canActivate: [appelsOffreGuard],
    title: "Avis d'attribution — Sen-CSU",
    data: { description: "Avis d'attribution des marchés publics de la Sen-CSU." }
  },
  {
    path: 'appels-offre/fournisseurs', loadComponent: () => import('./fournisseurs/fournisseurs').then(m => m.FournisseursComponent),
    canActivate: [appelsOffreGuard],
    title: "Demande d'agrément fournisseur — Sen-CSU",
    data: { description: "Demande d'agrément fournisseur auprès de la Sen-CSU." }
  },
  {
    path: 'carriere', loadComponent: () => import('./carriere/carriere').then(m => m.CarriereComponent),
    title: 'Carrières — Sen-CSU',
    data: { description: "Offres d'emploi et candidatures spontanées à l'Agence de la Couverture Sanitaire Universelle (Sen-CSU)." }
  },
  { path: 'maintenance', loadComponent: () => import('./maintenance/maintenance').then(m => m.MaintenanceComponent), title: 'Section en préparation — Sen-CSU' },
  {
    path: 'cec', loadComponent: () => import('./cec/cec').then(m => m.CecComponent),
    title: 'Carte Égalité des Chances — Sen-CSU',
    data: { description: "Carte Égalité des Chances (CEC) : prise en charge santé au Sénégal." }
  },
  {
    path: 'pnbsf', loadComponent: () => import('./pnbsf/pnbsf').then(m => m.PnbsfComponent),
    title: 'PNBSF — Sen-CSU',
    data: { description: "Programme National de Bourses de Sécurité Familiale (PNBSF) et couverture santé." }
  },
  {
    path: 'reclamation-form', loadComponent: () => import('./reclamation-form/reclamation-form').then(m => m.ReclamationFormComponent),
    title: 'Réclamation — Sen-CSU',
    data: { description: "Formulaire de réclamation auprès de la Sen-CSU." }
  },

  { path: '**', redirectTo: '', pathMatch: 'full' }
];
