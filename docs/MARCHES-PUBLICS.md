# Documentation technique — Module « Marchés Publics »

Application **SEN-CSU** (`pj2`) — Frontend Angular 20 (SSR) + API Express / PostgreSQL (Neon).

Ce document décrit **uniquement** la brique *Marchés Publics* (la section transversale
de l'architecture générale décrite dans [ARCHITECTURE.md](../ARCHITECTURE.md)).
Il couvre les 4 sous-modules :

| # | Sous-module | Préfixe API | Table |
|---|-------------|-------------|-------|
| 1 | **PPM** — Plan de Passation des Marchés | `/api/ppm` | `ppm` |
| 2 | **Appels d'offres** | `/api/appels-offre` | `appels_offre` |
| 3 | **Avis d'attribution** | `/api/avis-attribution` | `avis_attribution` |
| 4 | **Espace Fournisseurs** (dépôt d'agrément) | `/api/fournisseurs` | `fournisseurs_agrements` |

---

## 1. Vue d'ensemble

Le module expose un **hub public** (`/appels-offre`) qui mène à 4 pages publiques, et
un **espace de gestion** dans `/admin`. Tous les sous-modules suivent le même patron :

```
Table PostgreSQL  ↔  Route Express (CRUD + Zod)  ↔  Service Angular  ↔  Écran (public + admin)
```

### Principes communs

- **Modèle de publication** : la cellule rédige en *brouillon* (`is_published = false`),
  le contenu n'apparaît côté public qu'une fois **publié**. (Sauf l'Espace Fournisseurs,
  qui est un flux entrant et non un contenu publié — voir §6.)
- **Traçabilité « dernière modif »** : chaque table porte `updated_by` (FK `users`) et
  `updated_at`, mis à jour à chaque écriture. Pas d'historique complet, seulement le
  dernier éditeur.
- **Contrôle d'accès** : lecture publique libre ; écriture réservée au rôle
  `cellule-pm` ou `admin` (middleware `celluleOrAdmin`).
- **Uploads PDF** : via Cloudinary (`makeUpload`), filtre `pdfOnly`, 10 Mo max.
- **Validation** : Zod sur toutes les entrées d'écriture.

---

## 2. Rôles & sécurité

### Chaîne d'autorisation (backend)

```
authMiddleware  →  celluleOrAdmin  →  handler
```

- **`auth.middleware.js`** : lit le JWT (cookie `auth_token` httpOnly en priorité,
  fallback header `Authorization: Bearer`), vérifie la signature (`JWT_SECRET`),
  injecte `req.user` (`{ id, email, role }`). Sinon `401` (absent) / `403` (invalide).
- **`cellule.middleware.js`** : autorise seulement `role === 'cellule-pm'` ou
  `role === 'admin'`, sinon `403`.

| Opération | Auth | Rôle requis |
|-----------|------|-------------|
| `GET /` (liste publique) | ❌ | — (public) |
| `GET /manage` | ✅ | cellule-pm / admin |
| `POST` / `PUT` / `DELETE` | ✅ | cellule-pm / admin |
| `POST /api/fournisseurs` (dépôt) | ❌ | — (public anonyme) |

> ⚠️ **Limite connue** : la sidebar admin affiche tous les liens quel que soit le rôle.
> Un utilisateur `cellule-pm` voit donc les menus des autres entités, mais les
> endpoints correspondants restent protégés `adminOnly` et renvoient `403`.
> La restriction est effective côté API, pas (encore) côté UI.

### Frontend
- `AuthGuard` protège tout `/admin` (redirige vers `/login`).
- `AuthInterceptor` ajoute le `Bearer` token aux requêtes sortantes.

---

## 3. Stockage des fichiers (Cloudinary)

Fabrique partagée : [`backend/config/cloudinary.js`](../backend/config/cloudinary.js).

```js
const upload = makeUpload('appels-offre', { fileFilter: pdfOnly });
```

- **Dossier** : `sencsu/<route>` (ex. `sencsu/appels-offre`, `sencsu/fournisseurs`).
- **resource_type** déterminé par mimetype → les PDF partent en `raw`.
- **public_id** : pour les `raw`, l'extension `.pdf` est **conservée** dans le
  `public_id`. Sans cela Cloudinary sert le fichier en `application/octet-stream`
  (téléchargement forcé) au lieu d'un affichage inline navigateur.
- **`pdfOnly`** : `fileFilter` qui rejette silencieusement tout ce qui n'est pas
  `application/pdf` (`cb(null, false)` — la route vérifie ensuite la présence du
  fichier et renvoie un message clair, sans casser le flux multer).
- Après upload, `file.path` contient la `secure_url` Cloudinary → stockée en base.
- Variables d'env requises : `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
  `CLOUDINARY_API_SECRET`.

> Remplace l'ancien stockage disque Render (`/uploads`), éphémère car effacé à
> chaque redéploiement.

---

## 4. Schéma de base de données

Migrations manuelles dans [`backend/migrations/`](../backend/migrations/) — **pas de
framework de migration**, les `.sql` se lancent à la main (éditeur SQL Neon ou script
`node` ponctuel). ⚠️ Base **partagée** local ↔ prod (cf. mémoire `deploy-architecture`).

### `ppm` — `001_create_ppm.sql`
Plan de passation. Champs métier : `reference`, `objet` (NOT NULL), `type_marche`,
`mode_passation`, `source_financement`, `montant_estime` (NUMERIC 15,2),
`annee` (NOT NULL), `trimestre` (T1–T4), `date_prevue_lancement`,
`statut` (`prevu`|`lance`|`attribue`|`cloture`, défaut `prevu`), `is_published`.
Index : `idx_ppm_published (is_published, annee)`, `idx_ppm_annee`.

### `appels_offre` — `002_create_appels_offre.sql`
`reference`, `objet` (NOT NULL), `description`, `type_marche`, `mode_passation`,
`source_financement`, `date_lancement`, `date_limite` (date limite de dépôt),
`file_url` (PDF de l'avis), `statut` (`ouvert`|`cloture`, défaut `ouvert`),
`is_published`. Index : `idx_ao_published (is_published, date_limite)`, `idx_ao_statut`.

### `avis_attribution` — `003_create_avis_attribution.sql`
`reference`, `objet` (NOT NULL), `attributaire` (NOT NULL), `montant` (NUMERIC 15,2),
`type_marche`, `mode_passation`, `date_attribution`, `file_url`, `is_published`.
Index : `idx_attr_published (is_published, date_attribution)`.

### `fournisseurs_agrements` — `004_create_fournisseurs_agrements.sql`
`numero` (VARCHAR UNIQUE NOT NULL, ex. `AGR-2026-0001`), `raison_sociale` (NOT NULL),
`ninea`, `rccm`, `domaine`, `adresse`, `telephone`, `email`, `contact_nom`, `message`,
`doc_registre_url`, `doc_fiscale_url`, `doc_complementaire_url`,
`statut` (`recu`|`en_cours`|`valide`|`rejete`, défaut `recu`), `note_traitement`.
Index : `idx_agr_statut`, `idx_agr_numero`.

> Colonnes communes à toutes les tables : `created_by`/`updated_by`
> (`REFERENCES users(id) ON DELETE SET NULL`), `created_at`/`updated_at` (TIMESTAMPTZ).
> Exception : `fournisseurs_agrements` n'a pas de `created_by` (dépôt anonyme).

---

## 5. API REST

### Patron commun (PPM, Appels d'offres, Avis d'attribution)

| Méthode & route | Accès | Rôle | Description |
|-----------------|-------|------|-------------|
| `GET /` | public | — | Liste **publiée uniquement** (`WHERE is_published = true`), filtres en query |
| `GET /manage` | privé | cellule/admin | Tout (brouillons inclus) + `updated_by_name` (LEFT JOIN users) |
| `POST /` | privé | cellule/admin | Création |
| `PUT /:id` | privé | cellule/admin | Mise à jour **partielle** (SET dynamique sur les champs fournis) |
| `DELETE /:id` | privé | cellule/admin | Suppression |

Détails par sous-module :

- **PPM** (`ppm.routes.js`) : JSON pur (pas d'upload). Filtres publics
  `?annee=&type_marche=&statut=`. Tri `annee DESC, created_at DESC`.
- **Appels d'offres** (`appels-offre.routes.js`) : multipart, `upload.single('file')`.
  Filtres `?statut=&type_marche=`. Tri `date_limite ASC` (les plus urgents d'abord).
- **Avis d'attribution** (`avis-attribution.routes.js`) : multipart,
  `upload.single('file')`. Filtre `?type_marche=`. Tri `date_attribution DESC`.

#### Conventions multipart importantes
En `multipart/form-data`, **tous les champs arrivent en chaîne**. D'où :
- `clean(body)` : normalise `'' → undefined` avant validation Zod.
- `empty(v)` : helper `'' | null | undefined → undefined`.
- `parseBool(v)` : `v === true || v === 'true'` pour `is_published`.
- À l'`UPDATE`, le `file_url` existant est **conservé** si aucun nouveau PDF n'est
  envoyé (on ne met `file_url` que si `req.file` est présent).

### Espace Fournisseurs (`fournisseurs.routes.js`) — spécifique

| Méthode & route | Accès | Description |
|-----------------|-------|-------------|
| `POST /` | **public anonyme** | Dépôt d'agrément, `depotLimiter` + 3 PDF |
| `GET /manage` | cellule/admin | Liste, filtre `?statut=` |
| `PUT /:id` | cellule/admin | Mise à jour `statut` + `note_traitement` |
| `DELETE /:id` | cellule/admin | Suppression |

Particularités du `POST` public :
- **Pas d'auth** : c'est un guichet ouvert aux fournisseurs sans compte.
- **Rate limit dédié** `depotLimiter` : **8 dépôts / heure / IP** (anti-abus du
  stockage Cloudinary), en plus du limiteur global `/api/` (150 req / 15 min).
- **3 fichiers** via `upload.fields([doc_registre, doc_fiscale, doc_complementaire])`.
  `doc_registre` **et** `doc_fiscale` sont **obligatoires** (sinon `400`) ;
  `doc_complementaire` est optionnel.
- **Numéro auto** `AGR-[ANNÉE]-[chrono 4 chiffres]` généré par `nextNumero()`.
- **Réponse** `201` : `{ success, message, numero, created_at }`.

#### Génération du numéro `AGR-AAAA-NNNN`

```js
async function nextNumero() {
  const annee = new Date().getFullYear();
  const { rows } = await pool.query(
    `SELECT COALESCE(MAX(CAST(SPLIT_PART(numero, '-', 3) AS INTEGER)), 0) + 1 AS prochain
     FROM fournisseurs_agrements WHERE numero LIKE $1`,
    [`AGR-${annee}-%`]
  );
  return `AGR-${annee}-${String(rows[0].prochain).padStart(4, '0')}`;
}
```

- Le compteur est **scopé à l'année** (`LIKE 'AGR-2026-%'`) → il **repart à `0001`
  automatiquement chaque 1er janvier**. Dernier 2026 = `AGR-2026-0042` →
  premier 2027 = `AGR-2027-0001` (pas `0043`).
- `numero` étant `UNIQUE`, en cas de collision concurrente (`err.code === '23505'`),
  l'insertion est **retentée** (boucle de 2 tentatives) avant d'abandonner en `500`.

---

## 6. Frontend

### Routes (`src/app/app.routes.ts`)

Publiques :

| Chemin | Composant |
|--------|-----------|
| `/appels-offre` | `MarchesPublicsComponent` (hub) |
| `/appels-offre/ppm` | `PpmPublicComponent` |
| `/appels-offre/avis` | `AppelsOffreComponent` |
| `/appels-offre/attributions` | `AvisAttributionComponent` |
| `/appels-offre/fournisseurs` | `FournisseursComponent` |

Admin (sous `/admin`, protégé par `AuthGuard`) :

| Chemin | Composant |
|--------|-----------|
| `admin/ppm-gestion` | `PpmGestionComponent` |
| `admin/appels-offre-gestion` | `AppelsOffreGestionComponent` |
| `admin/avis-attribution-gestion` | `AvisAttributionGestionComponent` |
| `admin/fournisseurs-gestion` | `FournisseursGestionComponent` |

### Services (`src/app/services/`)

Un service par sous-module (`ppm.service.ts`, `appels-offre.service.ts`,
`avis-attribution.service.ts`, `fournisseurs.service.ts`). Chacun expose les types
(`interface` + `type` de statut) et les méthodes CRUD. Les créations/màj qui portent
un PDF passent un `FormData` ; les listes acceptent des filtres via `HttpParams`.
Gestion d'erreur centralisée (`handleError` → `throwError(new Error(message))`).

Exemple (`FournisseursService`) :
```ts
deposer(data: FormData): Observable<DepotResponse>        // POST public
getAllForManage(statut?): Observable<Agrement[]>          // GET /manage
update(id, { statut, note_traitement }): Observable<...>  // PUT
delete(id): Observable<...>                               // DELETE
```

### Écrans

- **Hub** (`marches-publics`) : cartes vers les 4 pages.
- **Pages publiques** : composants standalone (signals + `computed`), filtres
  (type de marché, état), badges d'état. L'appel d'offres calcule une **expiration
  automatique** à partir de `date_limite` (`estEnCours()` → badge « En cours » /
  « Clôturé »), indépendamment du `statut` stocké.
- **Espace Fournisseurs public** : formulaire `ReactiveForms` + 3 champs fichiers,
  `submit()` construit un `FormData`, puis **écran de confirmation** affichant le
  numéro `AGR-…` retourné (signal `numeroConfirme`) ; `nouveauDepot()` réinitialise.
- **Écrans admin** : modelés sur `ppm-gestion`. Liste + formulaire, upload PDF
  (signals `selectedFile` / `existingFileUrl`), `togglePublish` via `FormData`.
  La gestion fournisseurs ajoute un panneau détail dépliable (`detailId`), le
  changement de statut et la note de traitement.

---

## 7. Déploiement & exploitation

- **Frontend** : Vercel (`pj2-gr26.vercel.app`) — re-alias obligatoire après chaque
  déploiement.
- **Backend** : Render (`sencsu-backend.onrender.com`) — **auto-deploy au `git push`**
  sur `main`.
- **DB** : Neon PostgreSQL — **une seule base partagée local ↔ prod**.
- **Storage** : Cloudinary (`sencsu/<route>`).

### Checklist mise en service d'un sous-module
1. Exécuter la migration `.sql` sur Neon (une fois).
2. Vérifier les variables Cloudinary dans le dashboard Render.
3. Créer/identifier un utilisateur `cellule-pm` (ou `admin`).
4. Saisir le contenu dans l'admin **et le publier** (`is_published = true`) — sans
   publication, rien n'apparaît côté public (cause fréquente de « contenu invisible »).

### Pièges connus
- **Contenu invisible côté public** → presque toujours un oubli de publication
  (`is_published = false`), pas un bug.
- **Tester en local écrit dans la prod** (base partagée). Les dépôts de test
  consomment de vrais numéros `AGR-…` et du stockage Cloudinary.
- **Réveil à froid Render** : la 1ʳᵉ requête après inactivité peut être lente
  (un retry interceptor côté front est en place).

---

## 8. Pistes d'amélioration (non implémentées)

- Restreindre la **sidebar admin** selon le rôle (UI alignée sur l'API).
- **Export PDF / Excel** du PPM.
- Tests `.spec.ts` sur les services et composants du module.
- Notification e-mail à la cellule lors d'un nouveau dépôt fournisseur.
