import { Routes } from '@angular/router';

// Public Components
import { HeroComponent } from './hero/hero';
import { ProgrammeComponent } from './programme/programme';
import { MediaComponent } from './media/media';
import { MissionsvisionComponent } from './missionsvision/missionsvision';
import { BanqueDImageComponent } from './banque-d-image/banque-d-image';
import { CommuniquesPresseComponent } from './communiques-presse/communiques-presse';
import { RapportsOfficielsComponent } from './rapports-officiels/rapports-officiels';
import { Guide } from './guide/guide';
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
import { DecretsComponent } from './decrets/decrets';
import { PpmPublicComponent } from './ppm-public/ppm-public';
import { MarchesPublicsComponent } from './marches-publics/marches-publics';
import { AvisAttributionComponent } from './avis-attribution/avis-attribution';
import { FournisseursComponent } from './fournisseurs/fournisseurs';

// Admin Components
import { AdminComponent } from './admin/admin';
import { LoginForm } from './admin/login-form/login-form';
import { NewslettersForm } from './admin/newsletters-form/newsletters-form';
import { DecretsForm } from './admin/decrets-form/decrets-form';
import { ImagesBankForm } from './admin/images-bank-form/images-bank-form';
import { OfficialReportsForm } from './admin/official-reports-form/official-reports-form';
import { GuidesForm } from './admin/guides-form/guides-form';
import { AuditManualsForm } from './admin/audit-manuals-form/audit-manuals-form';
import { OffresEmploiForm } from './admin/offres-emploi-form/offres-emploi-form';
import { CommuniqueFormComponent } from './admin/communiques-form/communiques-form';
import { BanqueImagesFormComponent } from './admin/banque-d-image-form/banque-d-image-form';
import { UsersListComponent } from './admin/users-list/users-list';
import { UserCreateForm } from './admin/user-create-form/user-create-form';
import { UserEditForm } from './admin/user-edit/user-edit';       

// === NOUVEAUX FORMULAIRES ===
// import { VideosForm } from './admin/videos-form/videos-form';
import { TestimonialsFormComponent } from './admin/testimonials-form/testimonials-form';
import { ActualitesFormComponent } from './admin/actualites-form/actualites-form';
import { PpmGestionComponent } from './admin/ppm-gestion/ppm-gestion';
import { AppelsOffreGestionComponent } from './admin/appels-offre-gestion/appels-offre-gestion';
import { AvisAttributionGestionComponent } from './admin/avis-attribution-gestion/avis-attribution-gestion';
import { FournisseursGestionComponent } from './admin/fournisseurs-gestion/fournisseurs-gestion';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminOnlyGuard } from './guards/admin-only.guard';
import { MaintenanceComponent } from './maintenance/maintenance';
import { CecComponent } from './cec/cec';
import { PnbsfComponent } from './pnbsf/pnbsf';
import { ReclamationFormComponent } from './reclamation-form/reclamation-form';
import { VideosFormComponent } from './admin/videos-form/videos-form';

export const routes: Routes = [
  // ====================== ROUTES PUBLIQUES ======================
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
  { path: 'appels-offre', component: MarchesPublicsComponent },
  { path: 'appels-offre/ppm', component: PpmPublicComponent },
  { path: 'appels-offre/avis', component: AppelsOffreComponent },
  { path: 'appels-offre/attributions', component: AvisAttributionComponent },
  { path: 'appels-offre/fournisseurs', component: FournisseursComponent },
  { path: 'carriere', component: CarriereComponent },
  { path: 'login', component: LoginForm },

  // ====================== ADMIN ======================
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },

      { path: 'newsletters-form', component: NewslettersForm },
      { path: 'decrets-form', component: DecretsForm },
      { path: 'images-bank-form', component: ImagesBankForm },
      { path: 'official-reports-form', component: OfficialReportsForm },
      { path: 'guides-form', component: GuidesForm },
      { path: 'audit-manuals-form', component: AuditManualsForm },
      { path: 'offres-emploi-form', component: OffresEmploiForm },
      { path: 'ppm-gestion', component: PpmGestionComponent },
      { path: 'appels-offre-gestion', component: AppelsOffreGestionComponent },
      { path: 'avis-attribution-gestion', component: AvisAttributionGestionComponent },
      { path: 'fournisseurs-gestion', component: FournisseursGestionComponent },
      { path: 'communiques-form', component: CommuniqueFormComponent },
      { path: 'banque_d_image-form', component: BanqueImagesFormComponent },

      // ===  FORMULAIRES MEDIAS===
      { path: 'videos-form', component: VideosFormComponent },
      { path: 'testimonials-form', component: TestimonialsFormComponent },
      { path: 'actualites-form', component: ActualitesFormComponent },

      // Gestion Utilisateurs (réservée aux admins)
      { path: 'users', component: UsersListComponent, canActivate: [AdminGuard] },
      // Pas de guard ici : le composant affiche lui-même un message de blocage
      // (et masque le formulaire) si l'utilisateur n'est pas admin.
      { path: 'user-create-form', component: UserCreateForm },
      { path: 'user-edit/:id', component: UserEditForm, canActivate: [AdminOnlyGuard] }
    ]
  },

  { path: 'maintenance', component: MaintenanceComponent },
  { path: 'cec', component: CecComponent },
  { path: 'pnbsf', component: PnbsfComponent },
  { path: 'reclamation-form', component: ReclamationFormComponent },

  { path: '**', redirectTo: '', pathMatch: 'full' }
];