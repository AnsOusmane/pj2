// ====================================================================
// Facebook — Fil des publications de la page (API Graph officielle)
// --------------------------------------------------------------------
// Récupère les publications de la page Facebook de l'agence et les
// expose au front sous une forme normalisée, sans iframe / Page Plugin.
//
// Authentification : FB_PAGE_ACCESS_TOKEN. Ce token peut être :
//   • un token d'utilisateur système (Business) — recommandé, permanent ;
//   • un token de page longue durée.
// Dans les deux cas, le backend résout automatiquement le *Page Access
// Token* via /me/accounts (la nouvelle version des Pages l'exige pour
// lire /{page}/posts), puis interroge la page.
//
// FB_PAGE_ID (optionnel) : si plusieurs pages sont accessibles, fixe
// laquelle utiliser. Sinon, la première page est prise.
//
// ⚠️ L'API Graph ne lit que les publications d'une page que l'on
//    administre (restriction Facebook depuis 2018).
//
// Caches mémoire : posts 15 min, page token 50 min.
// ====================================================================
const express = require('express');
const router = express.Router();

const GRAPH_VERSION = process.env.FB_GRAPH_VERSION || 'v21.0';
const TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || '';
const PAGE_ID = process.env.FB_PAGE_ID || ''; // optionnel
const POSTS_TTL_MS = 15 * 60 * 1000;          // 15 minutes
const PAGE_TOKEN_TTL_MS = 50 * 60 * 1000;     // 50 minutes
const LIMIT = 12;                             // nb de publications récupérées
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;

// Champs demandés à l'API Graph.
const FIELDS = [
  'id',
  'message',
  'story',
  'created_time',
  'permalink_url',
  'full_picture',
  'attachments{media_type,media,url}',
].join(',');

let postsCache = { at: 0, data: null };
let pageCache = { at: 0, id: null, token: null };

/**
 * Résout l'identifiant + le Page Access Token à partir du token configuré.
 * Met le résultat en cache (50 min) pour éviter un appel /me/accounts à
 * chaque requête. Lève une erreur explicite si aucune page n'est accessible.
 */
async function resolvePage() {
  if (pageCache.token && Date.now() - pageCache.at < PAGE_TOKEN_TTL_MS) {
    return pageCache;
  }

  const url =
    `${GRAPH}/me/accounts?fields=id,name,access_token` +
    `&access_token=${encodeURIComponent(TOKEN)}`;
  const json = await (await fetch(url)).json();

  if (json.error) {
    throw new Error(json.error.message || 'me/accounts a échoué');
  }

  const pages = json.data || [];
  if (pages.length === 0) {
    throw new Error('Aucune page accessible avec ce token (vérifier les droits du système user).');
  }

  const page = PAGE_ID
    ? pages.find((p) => String(p.id) === String(PAGE_ID))
    : pages[0];

  if (!page) {
    throw new Error(`Page ${PAGE_ID} introuvable parmi les pages accessibles.`);
  }

  pageCache = { at: Date.now(), id: page.id, token: page.access_token };
  return pageCache;
}

/**
 * Transforme une publication brute de l'API Graph en objet simple
 * consommé par le front (texte, image, lien, date).
 */
function normalize(post) {
  const att = post.attachments && post.attachments.data && post.attachments.data[0];
  const image =
    post.full_picture ||
    (att && att.media && att.media.image && att.media.image.src) ||
    null;

  return {
    id: post.id,
    message: post.message || post.story || '',
    image_url: image,
    permalink_url: post.permalink_url || null,
    created_time: post.created_time || null,
    media_type: (att && att.media_type) || (image ? 'photo' : 'status'),
  };
}

// GET /api/facebook/posts → Public
router.get('/posts', async (req, res) => {
  // Token absent → liste vide (le site reste fonctionnel).
  if (!TOKEN) {
    return res.json({ configured: false, posts: [] });
  }

  // Cache encore valide → réponse immédiate.
  if (postsCache.data && Date.now() - postsCache.at < POSTS_TTL_MS) {
    return res.json({ configured: true, cached: true, posts: postsCache.data });
  }

  try {
    const page = await resolvePage();

    const url =
      `${GRAPH}/${page.id}/posts` +
      `?fields=${encodeURIComponent(FIELDS)}` +
      `&limit=${LIMIT}` +
      `&access_token=${encodeURIComponent(page.token)}`;

    const resp = await fetch(url);
    const json = await resp.json();

    if (!resp.ok || json.error) {
      const msg = (json.error && json.error.message) || `HTTP ${resp.status}`;
      console.error('Erreur API Facebook:', msg);

      // Le page token a pu expirer → on invalide le cache pour le re-résoudre.
      pageCache = { at: 0, id: null, token: null };

      // On sert le cache (même périmé) pour ne pas casser la page.
      if (postsCache.data) {
        return res.json({ configured: true, cached: true, stale: true, posts: postsCache.data });
      }
      return res.status(502).json({ configured: true, posts: [], error: 'Facebook indisponible' });
    }

    const posts = (json.data || []).map(normalize);
    postsCache = { at: Date.now(), data: posts };

    res.json({ configured: true, cached: false, posts });
  } catch (err) {
    console.error('Erreur récupération posts Facebook:', err.message || err);
    if (postsCache.data) {
      return res.json({ configured: true, cached: true, stale: true, posts: postsCache.data });
    }
    res.status(502).json({ configured: true, posts: [], error: 'Facebook indisponible' });
  }
});

module.exports = router;
