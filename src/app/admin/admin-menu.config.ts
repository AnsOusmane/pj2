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
  /** Emoji affiché devant le libellé. */
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
      { key: 'dashboard', label: 'Dashboard', icon: '\u{1F4CA}', route: 'dashboard', comingSoon: true }, // 📊
      { key: 'users', label: 'Utilisateurs', icon: '\u{1F464}', route: 'users', adminOnly: true }, // 👤
    ],
  },
  {
    title: 'Contenu',
    items: [
      { key: 'newsletters', label: 'News / Newsletters', icon: '\u{1F4F0}', route: 'newsletters-form' }, // 📰
      { key: 'rapports', label: 'Rapports officiels', icon: '\u{1F4D1}', route: 'official-reports-form' }, // 📑
      { key: 'decrets', label: 'Décrets', icon: '\u{2696}\u{FE0F}', route: 'decrets-form' }, // ⚖️
      { key: 'communiques', label: 'Communiqués', icon: '\u{1F4E2}', route: 'communiques-form' }, // 📢
      { key: 'guides', label: 'Guides', icon: '\u{1F4D8}', route: 'guides-form' }, // 📘
    ],
  },
  {
    title: 'Médias',
    items: [
      { key: 'media', label: 'Dossiers médias', icon: '\u{1F39E}\u{FE0F}', route: 'media', comingSoon: true }, // 🎞️
      { key: 'banque-images', label: "Banque d'images", icon: '\u{1F5BC}\u{FE0F}', route: 'images-bank-form' }, // 🖼️
    ],
  },
  {
    title: 'Carrière',
    items: [
      { key: 'offres-emploi', label: "Publier une offre", icon: '\u{1F4BC}', route: 'offres-emploi-form' }, // 💼
      { key: 'offres-emploi-gestion', label: "Gérer les offres", icon: '\u{1F5C2}\u{FE0F}', route: 'offres-emploi-gestion' }, // 🗂️
      { key: 'candidatures', label: 'Candidatures', icon: '\u{1F4C4}', route: 'candidatures' }, // 📄
    ],
  },
  {
    title: 'Marchés Publics',
    items: [
      { key: 'ppm', label: 'Plan de Passation (PPM)', icon: '\u{1F4CB}', route: 'ppm-gestion' }, // 📋
      { key: 'appels-offre', label: "Appels d'offres", icon: '\u{1F4E8}', route: 'appels-offre-gestion' }, // 📨
      { key: 'avis-attribution', label: "Avis d'attribution", icon: '\u{1F3C6}', route: 'avis-attribution-gestion' }, // 🏆
      { key: 'fournisseurs', label: "Demande d'agrément", icon: '\u{1F91D}', route: 'fournisseurs-gestion' }, // 🤝
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
