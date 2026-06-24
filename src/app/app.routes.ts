import { Routes } from '@angular/router';

// Guards — gardés en import direct (légers, requis pour le matching des routes)
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminOnlyGuard } from './guards/admin-only.guard';

// NB : tous les composants sont chargés en lazy (`loadComponent`) afin de les
// sortir du bundle initial. Chaque route ne télécharge son code qu'à la visite.

export const routes: Routes = [
  // ====================== ROUTES PUBLIQUES ======================
  { path: '', loadComponent: () => import('./hero/hero').then(m => m.HeroComponent) },
  { path: 'programme/:id', loadComponent: () => import('./programme/programme').then(m => m.ProgrammeComponent) },
  { path: 'media', loadComponent: () => import('./media/media').then(m => m.MediaComponent) },
  { path: 'missionsvision', loadComponent: () => import('./missionsvision/missionsvision').then(m => m.MissionsvisionComponent) },
  { path: 'banque-images', loadComponent: () => import('./banque-d-image/banque-d-image').then(m => m.BanqueDImageComponent) },
  { path: 'communiques-presse', loadComponent: () => import('./communiques-presse/communiques-presse').then(m => m.CommuniquesPresseComponent) },
  { path: 'rapports-officiels', loadComponent: () => import('./rapports-officiels/rapports-officiels').then(m => m.RapportsOfficielsComponent) },
  { path: 'guide', loadComponent: () => import('./guide/guide').then(m => m.Guide) },
  { path: 'decrets', loadComponent: () => import('./decrets/decrets').then(m => m.DecretsComponent) },
  { path: 'manuel-d-audit', loadComponent: () => import('./manuel-audit/manuel-audit').then(m => m.ManuelAuditComponent) },
  { path: 'contact', loadComponent: () => import('./contact-form/contact-form').then(m => m.ContactFormComponent) },
  { path: 'nos-services-regionaux', loadComponent: () => import('./nos-services-regionaux/nos-services-regionaux').then(m => m.NosServicesRegionauxComponent) },
  { path: 'zero-cinq-ans', loadComponent: () => import('./zero-cinq-ans/zero-cinq-ans').then(m => m.ZeroCinqAnsComponent) },
  { path: 'plan-sesame', loadComponent: () => import('./plan-sesame/plan-sesame').then(m => m.PlanSesameComponent) },
  { path: 'dialyse', loadComponent: () => import('./dialyse/dialyse').then(m => m.DialyseComponent) },
  { path: 'cesarienne', loadComponent: () => import('./cesarienne/cesarienne').then(m => m.CesarienneComponent) },
  { path: 'assurance-maladie', loadComponent: () => import('./assurance-maladie/assurance-maladie').then(m => m.AssuranceMaladieComponent) },
  { path: 'appels-offre', loadComponent: () => import('./marches-publics/marches-publics').then(m => m.MarchesPublicsComponent) },
  { path: 'appels-offre/ppm', loadComponent: () => import('./ppm-public/ppm-public').then(m => m.PpmPublicComponent) },
  { path: 'appels-offre/avis', loadComponent: () => import('./appels-offre/appels-offre').then(m => m.AppelsOffreComponent) },
  { path: 'appels-offre/attributions', loadComponent: () => import('./avis-attribution/avis-attribution').then(m => m.AvisAttributionComponent) },
  { path: 'appels-offre/fournisseurs', loadComponent: () => import('./fournisseurs/fournisseurs').then(m => m.FournisseursComponent) },
  { path: 'carriere', loadComponent: () => import('./carriere/carriere').then(m => m.CarriereComponent) },
  { path: 'login', loadComponent: () => import('./admin/login-form/login-form').then(m => m.LoginForm) },

  // ====================== ADMIN ======================
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin').then(m => m.AdminComponent),
    canActivate: [AuthGuard],
    children: [
      // Atterrissage : redirige vers la première section accessible selon le rôle/permissions.
      { path: '', loadComponent: () => import('./admin/admin-home/admin-home').then(m => m.AdminHomeComponent), pathMatch: 'full' },

      { path: 'newsletters-form', loadComponent: () => import('./admin/newsletters-form/newsletters-form').then(m => m.NewslettersForm) },
      { path: 'decrets-form', loadComponent: () => import('./admin/decrets-form/decrets-form').then(m => m.DecretsForm) },
      { path: 'images-bank-form', loadComponent: () => import('./admin/images-bank-form/images-bank-form').then(m => m.ImagesBankForm) },
      { path: 'official-reports-form', loadComponent: () => import('./admin/official-reports-form/official-reports-form').then(m => m.OfficialReportsForm) },
      { path: 'guides-form', loadComponent: () => import('./admin/guides-form/guides-form').then(m => m.GuidesForm) },
      { path: 'audit-manuals-form', loadComponent: () => import('./admin/audit-manuals-form/audit-manuals-form').then(m => m.AuditManualsForm) },
      { path: 'offres-emploi-form', loadComponent: () => import('./admin/offres-emploi-form/offres-emploi-form').then(m => m.OffresEmploiForm) },
      { path: 'ppm-gestion', loadComponent: () => import('./admin/ppm-gestion/ppm-gestion').then(m => m.PpmGestionComponent) },
      { path: 'appels-offre-gestion', loadComponent: () => import('./admin/appels-offre-gestion/appels-offre-gestion').then(m => m.AppelsOffreGestionComponent) },
      { path: 'avis-attribution-gestion', loadComponent: () => import('./admin/avis-attribution-gestion/avis-attribution-gestion').then(m => m.AvisAttributionGestionComponent) },
      { path: 'fournisseurs-gestion', loadComponent: () => import('./admin/fournisseurs-gestion/fournisseurs-gestion').then(m => m.FournisseursGestionComponent) },
      { path: 'communiques-form', loadComponent: () => import('./admin/communiques-form/communiques-form').then(m => m.CommuniqueFormComponent) },
      { path: 'banque_d_image-form', loadComponent: () => import('./admin/banque-d-image-form/banque-d-image-form').then(m => m.BanqueImagesFormComponent) },

      // ===  FORMULAIRES MEDIAS===
      { path: 'videos-form', loadComponent: () => import('./admin/videos-form/videos-form').then(m => m.VideosFormComponent) },
      { path: 'testimonials-form', loadComponent: () => import('./admin/testimonials-form/testimonials-form').then(m => m.TestimonialsFormComponent) },
      { path: 'actualites-form', loadComponent: () => import('./admin/actualites-form/actualites-form').then(m => m.ActualitesFormComponent) },

      // Gestion Utilisateurs (réservée aux admins)
      { path: 'users', loadComponent: () => import('./admin/users-list/users-list').then(m => m.UsersListComponent), canActivate: [AdminGuard] },
      // Pas de guard ici : le composant affiche lui-même un message de blocage
      // (et masque le formulaire) si l'utilisateur n'est pas admin.
      { path: 'user-create-form', loadComponent: () => import('./admin/user-create-form/user-create-form').then(m => m.UserCreateForm) },
      { path: 'user-edit/:id', loadComponent: () => import('./admin/user-edit/user-edit').then(m => m.UserEditForm), canActivate: [AdminOnlyGuard] }
    ]
  },

  { path: 'maintenance', loadComponent: () => import('./maintenance/maintenance').then(m => m.MaintenanceComponent) },
  { path: 'cec', loadComponent: () => import('./cec/cec').then(m => m.CecComponent) },
  { path: 'pnbsf', loadComponent: () => import('./pnbsf/pnbsf').then(m => m.PnbsfComponent) },
  { path: 'reclamation-form', loadComponent: () => import('./reclamation-form/reclamation-form').then(m => m.ReclamationFormComponent) },

  { path: '**', redirectTo: '', pathMatch: 'full' }
];
