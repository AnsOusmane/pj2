// Source unique de vérité du menu d'administration.
// Utilisée à la fois par la sidebar (admin.html) pour afficher / filtrer les
// entrées, et par le formulaire de création d'utilisateur pour cocher les
// éléments auxquels un utilisateur non-admin aura accès.
//
// La propriété `key` est l'identifiant de permission stocké en base (colonne
// users.permissions, jsonb). Un admin a accès à tout : ses permissions ne sont
// pas consultées.

export interface AdminMenuItem {
  /** Identifiant de permission (stocké en base). */
  key: string;
  /** Libellé affiché. */
  label: string;
  /** Nom d'icône Heroicons (voir shared/icon/icon.ts) affiché devant le libellé. */
  icon: string;
  /** Route relative à /admin. */
  route: string;
  /** Réservé aux admins : jamais assignable à un autre utilisateur. */
  adminOnly?: boolean;
  /** Entrée dont la page n'existe pas encore : non assignable, pas de redirection. */
  comingSoon?: boolean;
}

export interface AdminMenuGroup {
  title: string;
  items: AdminMenuItem[];
}

export const ADMIN_MENU: AdminMenuGroup[] = [
  {
    title: 'Général',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: 'chart-bar', route: 'dashboard', comingSoon: true },
      { key: 'chat-analytics', label: 'Chatbot (stats)', icon: 'chat-bubble-left-right', route: 'chat-analytics', adminOnly: true },
      { key: 'security-events', label: 'Journal de sécurité', icon: 'shield-check', route: 'security-events', adminOnly: true },
      { key: 'users', label: 'Utilisateurs', icon: 'users', route: 'users', adminOnly: true },
    ],
  },
  {
    title: 'Contenu',
    items: [
      { key: 'newsletters', label: 'News / Newsletters', icon: 'envelope', route: 'newsletters-form' },
      { key: 'rapports', label: 'Rapports officiels', icon: 'document-chart-bar', route: 'official-reports-form' },
      { key: 'decrets', label: 'Décrets', icon: 'scale', route: 'decrets-form' },
      { key: 'communiques', label: 'Communiqués', icon: 'megaphone', route: 'communiques-form' },
      { key: 'guides', label: 'Guides', icon: 'book-open', route: 'guides-form' },
      { key: 'actualites', label: 'Actualités', icon: 'newspaper', route: 'actualites-form' },
      { key: 'audit-manuals', label: "Manuels d'audit", icon: 'clipboard-document-check', route: 'audit-manuals-form' },
    ],
  },
  {
    title: 'Médias',
    items: [
      { key: 'media', label: 'Dossiers médias', icon: 'film', route: 'media', comingSoon: true },
      { key: 'banque-images', label: "Banque d'images", icon: 'photo', route: 'images-bank-form' },
      { key: 'videos', label: 'Vidéos', icon: 'video-camera', route: 'videos-form' },
      { key: 'testimonials', label: 'Témoignages', icon: 'chat-bubble-bottom-center-text', route: 'testimonials-form' },
    ],
  },
  {
    title: 'Carrière',
    items: [
      { key: 'offres-emploi', label: "Publier une offre", icon: 'paper-airplane', route: 'offres-emploi-form' },
      { key: 'offres-emploi-gestion', label: "Gérer les offres", icon: 'briefcase', route: 'offres-emploi-gestion' },
      { key: 'candidatures', label: 'Candidatures', icon: 'inbox-arrow-down', route: 'candidatures' },
    ],
  },
  {
    title: 'Marchés Publics',
    items: [
      { key: 'ppm', label: 'Plan de Passation (PPM)', icon: 'clipboard-document-list', route: 'ppm-gestion' },
      { key: 'appels-offre', label: "Appels d'offres", icon: 'document-duplicate', route: 'appels-offre-gestion' },
      { key: 'avis-attribution', label: "Avis d'attribution", icon: 'trophy', route: 'avis-attribution-gestion' },
      { key: 'fournisseurs', label: "Demande d'agrément", icon: 'identification', route: 'fournisseurs-gestion' },
    ],
  },
];

/**
 * Toutes les entrées assignables à un utilisateur non-admin :
 * on exclut les entrées réservées aux admins et celles dont la page n'existe pas.
 */
export const ASSIGNABLE_ITEMS: AdminMenuItem[] = ADMIN_MENU
  .flatMap((g) => g.items)
  .filter((i) => !i.adminOnly && !i.comingSoon);

export const ASSIGNABLE_PERMISSION_KEYS: string[] = ASSIGNABLE_ITEMS.map((i) => i.key);

/**
 * Première section réellement accessible pour cet utilisateur (route relative à /admin),
 * ou null si aucune. Un admin atterrit sur la gestion des utilisateurs.
 */
export function firstAccessibleRoute(
  role: string | undefined,
  permissions: string[] | undefined
): string | null {
  if (role === 'admin') return 'users';
  const perms = permissions || [];
  const item = ASSIGNABLE_ITEMS.find((i) => perms.includes(i.key));
  return item ? item.route : null;
}
