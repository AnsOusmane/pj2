# Architecture du projet — SenCSU (pj2)

Vue d'ensemble des grandes lignes de l'architecture : une application web composée
d'un **frontend Angular (SSR)** et d'une **API backend Express/PostgreSQL**.

```
pj2/
├── src/            → Frontend Angular 20 (SSR)
├── backend/        → API Express (Node, CommonJS)
└── dist/           → Build de production (frontend)
```

---

## 1. Frontend — Angular 20 (`src/`)

- **Framework** : Angular 20 (standalone components) avec **SSR + hydration**
  (`provideClientHydration(withEventReplay())` dans [app.config.ts](src/app/app.config.ts)).
- **Routing** : centralisé dans [app.routes.ts](src/app/app.routes.ts).
  - Routes publiques : pages institutionnelles/programmes (accueil, médias,
    communiqués, décrets, rapports, guides, services régionaux, programmes
    de santé — `zero-cinq-ans`, `plan-sesame`, `dialyse`, etc.).
  - Espace `/admin` : protégé par `AuthGuard`, avec sous-routes "form" pour
    chaque entité de contenu (actualités, newsletters, décrets, vidéos,
    témoignages, banque d'images, offres d'emploi…) + gestion des
    utilisateurs (`users`, `user-create-form`, `user-edit/:id`).

### Couche d'accès aux données
- **Services HTTP** (`src/app/services/*.service.ts`) : un service par
  entité métier (actualites, communiques, decrets, videos, testimonials,
  guides, audit-manuals, official-reports, offres-emploi, newsletters,
  images-bank, users, auth…), chacun consommant l'API REST du backend.
- **Configuration d'environnement** (`src/environments/`) :
  - `environment.ts` (dev) → API sur `http://localhost:3000/api`
  - `environment.prod.ts` (prod) → API sur Render
    (`https://sencsu-backend.onrender.com`)

### Sécurité côté client
- **AuthInterceptor** ([interceptors/auth.interceptor.ts](src/app/interceptors/auth.interceptor.ts)) :
  ajoute le token JWT en `Authorization: Bearer` sur les requêtes sortantes.
- **Guards** :
  - `AuthGuard` → bloque `/admin` si non connecté (redirige vers `/login`).
  - `AdminGuard` / `AdminOnlyGuard` → réservent certaines actions au rôle `admin`.
- L'état utilisateur courant est exposé via `AuthService.currentUser$`.

### Déploiement
- Frontend déployé sur **Vercel** (rewrite SPA `"/(.*)" → "/index.html"`,
  voir [vercel.json](src/vercel.json) et `.vercel/`).

---

## 2. Backend — API Express (`backend/`)

Point d'entrée : [server.js](backend/server.js) (Node, CommonJS, module
principal `main: server.js`).

### Sécurité (middlewares globaux)
- **helmet** : CSP stricte, HSTS, anti-clickjacking (`X-Frame-Options: deny`).
- **cors** : whitelist d'origines (`localhost:4200`, `sencsu.sn`,
  `pj2-gr26.vercel.app`) avec `credentials: true`.
- **cookie-parser** : lecture du cookie `auth_token` (JWT httpOnly).
- **express-rate-limit** : 150 req / 15 min sur `/api/*`, 12 req / h sur
  `/api/auth/*` (anti brute-force).
- Limite de payload JSON/urlencoded à `10kb`.

### Authentification
- [routes/auth.routes.js](backend/routes/auth.routes.js) :
  - `POST /api/auth/login` → vérifie email/mot de passe (bcrypt), génère un
    JWT (`jsonwebtoken`, expiration 8h) et le pose dans un **cookie httpOnly**
    (`auth_token`).
- [middleware/auth.js](backend/middleware/auth.js) : vérifie le JWT (cookie
  prioritaire, fallback Bearer token) et injecte `req.user` (id, email, role).
- Gestion des rôles `user` / `admin` via [routes/users.routes.js](backend/routes/users.routes.js)
  (CRUD utilisateurs réservé aux admins, validation `zod`).

### Routes métier (CRUD par entité)
Toutes montées sous `/api/...` dans `server.js` :

| Route             | Fichier                                  |
|-------------------|-------------------------------------------|
| `/api/communiques`| communiques.routes.js |
| `/api/newsletters`| newsletters.routes.js |
| `/api/decrets`    | decrets.routes.js |
| `/api/images-bank`| images-bank.routes.js |
| `/api/official-reports` | official-reports.routes.js |
| `/api/guides`     | guides.routes.js |
| `/api/audit-manuals` | audit-manuals.routes.js |
| `/api/offres-emploi` | offres-emploi.routes.js |
| `/api/auth`       | auth.routes.js |
| `/api/users`      | users.routes.js |
| `/api/testimonials` | testimonials.routes.js |
| `/api/actualites` | actualites.routes.js |
| `/api/videos`     | videos.routes.js |

Chaque route suit le même patron (ex. [actualites.routes.js](backend/routes/actualites.routes.js)) :
- `GET /` public (lecture en base, sans auth).
- `POST/PUT/DELETE` protégés par `authMiddleware` (+ `adminOnly` pour `users`).
- Validation des entrées avec **zod**.
- Upload de fichiers/images via **multer** (stockage disque dans
  `backend/uploads/<entite>/`, servi statiquement via `/uploads` et
  `/storage/uploads`).

> Note : `contact.routes.js` et `rapportsofficiels.routes.js` existent dans
> `backend/routes/` mais ne sont pas montés dans `server.js` (routes
> non utilisées / probablement legacy).

### Base de données
- **PostgreSQL (Neon)** via le driver `pg`, pool de connexions configuré
  dans [db.js](backend/db.js) (SSL, max 20 connexions, timeouts).
- `db_ancien.js` contient l'ancienne configuration MySQL, commentée
  (migration MySQL → PostgreSQL/Neon).

### Déploiement
- Backend déployé sur **Render** (cf. `apiBaseUrl` de production côté
  frontend).

---

## 3. Flux global

```
Navigateur ──(SSR Angular)──> sencsu.sn (Vercel)
        │
        ▼  fetch /api/* (cookie JWT httpOnly + Bearer fallback)
Express API (Render) ── helmet/cors/rate-limit/zod ──> PostgreSQL (Neon)
        │
        ▼
   /uploads (fichiers statiques : images, miniatures, PDF…)
```

- **Authentification** : login → JWT en cookie httpOnly → `AuthInterceptor`
  ajoute aussi le header `Authorization` → `authMiddleware` valide côté API
  → rôle `admin`/`user` contrôle l'accès aux opérations d'écriture.
- **Contenu** : chaque module de contenu (actualités, communiqués, décrets,
  vidéos, témoignages, guides, manuels d'audit, rapports officiels, banque
  d'images, newsletters, offres d'emploi) suit le même schéma
  **table PostgreSQL ↔ route Express ↔ service Angular ↔ formulaire admin**.
