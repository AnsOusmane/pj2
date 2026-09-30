import { Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminOnlyGuard } from './guards/admin-only.guard';

// Arbre de routes repris tel quel de pj2/src/app/app.routes.ts (section admin),
// avec le préfixe /admin conservé : AdminOnlyGuard et AdminHomeComponent
// naviguent vers des chemins absolus ('/admin/users', ['/admin', route]) qui
// dépendent de ce préfixe — le retirer demanderait de les modifier, ce qui
// sort du périmètre d'une simple extraction (Phase 1 du plan de séparation).

export const routes: Routes = [
  { path: '', redirectTo: 'admin', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./login-form/login-form').then(m => m.LoginForm),
    title: 'Connexion — Administration Sen-CSU'
  },

  {
    path: 'admin',
    loadComponent: () => import('./admin/admin').then(m => m.AdminComponent),
    canActivate: [AuthGuard],
    title: 'Administration — Sen-CSU',
    children: [
      { path: '', loadComponent: () => import('./admin/admin-home/admin-home').then(m => m.AdminHomeComponent), pathMatch: 'full' },

      { path: 'newsletters-form', loadComponent: () => import('./admin/newsletters-form/newsletters-form').then(m => m.NewslettersForm) },
      { path: 'decrets-form', loadComponent: () => import('./admin/decrets-form/decrets-form').then(m => m.DecretsForm) },
      { path: 'images-bank-form', loadComponent: () => import('./admin/images-bank-form/images-bank-form').then(m => m.ImagesBankForm) },
      { path: 'official-reports-form', loadComponent: () => import('./admin/official-reports-form/official-reports-form').then(m => m.OfficialReportsForm) },
      { path: 'guides-form', loadComponent: () => import('./admin/guides-form/guides-form').then(m => m.GuidesForm) },
      { path: 'audit-manuals-form', loadComponent: () => import('./admin/audit-manuals-form/audit-manuals-form').then(m => m.AuditManualsForm) },
      { path: 'offres-emploi-form', loadComponent: () => import('./admin/offres-emploi-form/offres-emploi-form').then(m => m.OffresEmploiForm) },
      { path: 'offres-emploi-gestion', loadComponent: () => import('./admin/offres-emploi-gestion/offres-emploi-gestion').then(m => m.OffresEmploiGestionComponent) },
      { path: 'ppm-gestion', loadComponent: () => import('./admin/ppm-gestion/ppm-gestion').then(m => m.PpmGestionComponent) },
      { path: 'appels-offre-gestion', loadComponent: () => import('./admin/appels-offre-gestion/appels-offre-gestion').then(m => m.AppelsOffreGestionComponent) },
      { path: 'avis-attribution-gestion', loadComponent: () => import('./admin/avis-attribution-gestion/avis-attribution-gestion').then(m => m.AvisAttributionGestionComponent) },
      { path: 'fournisseurs-gestion', loadComponent: () => import('./admin/fournisseurs-gestion/fournisseurs-gestion').then(m => m.FournisseursGestionComponent) },
      { path: 'candidatures', loadComponent: () => import('./admin/candidatures-gestion/candidatures-gestion').then(m => m.CandidaturesGestionComponent) },
      { path: 'communiques-form', loadComponent: () => import('./admin/communiques-form/communiques-form').then(m => m.CommuniqueFormComponent) },

      { path: 'videos-form', loadComponent: () => import('./admin/videos-form/videos-form').then(m => m.VideosFormComponent) },
      { path: 'testimonials-form', loadComponent: () => import('./admin/testimonials-form/testimonials-form').then(m => m.TestimonialsFormComponent) },
      { path: 'actualites-form', loadComponent: () => import('./admin/actualites-form/actualites-form').then(m => m.ActualitesFormComponent) },

      { path: 'chat-analytics', loadComponent: () => import('./admin/chat-analytics/chat-analytics').then(m => m.ChatAnalyticsComponent), canActivate: [AdminGuard] },
      { path: 'security-events', loadComponent: () => import('./admin/security-events/security-events').then(m => m.SecurityEventsComponent), canActivate: [AdminGuard] },

      { path: 'users', loadComponent: () => import('./admin/users-list/users-list').then(m => m.UsersListComponent), canActivate: [AdminGuard] },
      { path: 'user-create-form', loadComponent: () => import('./admin/user-create-form/user-create-form').then(m => m.UserCreateForm), canActivate: [AdminOnlyGuard] },
      { path: 'user-edit/:id', loadComponent: () => import('./admin/user-edit/user-edit').then(m => m.UserEditForm), canActivate: [AdminOnlyGuard] }
    ]
  },

  { path: '**', redirectTo: 'admin', pathMatch: 'full' }
];
