// ====================================================================
// Chatbot — repli conversationnel via l'API Claude (Anthropic)
// --------------------------------------------------------------------
// Le front (assistant SEN-CSU) répond d'abord via sa FAQ locale
// trilingue. Quand aucune entrée ne correspond, il interroge cette
// route pour obtenir une réponse conversationnelle (fr / wolof / en).
//
// Authentification : ANTHROPIC_API_KEY (dans backend/.env + Render).
//   • Si la clé est absente → { configured: false } : le front garde
//     son message de repli local (rien ne casse, aucun coût).
//
// Modèle : CHAT_MODEL (défaut « claude-sonnet-4-6 », bon compromis
//   qualité multilingue / coût). Surchargeable par variable d'env.
//
// Sécurité / coût :
//   • rate-limit dédié (plus strict que le /api/ global) ;
//   • messages et historique bornés en taille ;
//   • pas de streaming (réponse unique, plus simple à consommer).
// ====================================================================
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const MODEL = process.env.CHAT_MODEL || 'claude-sonnet-4-6';
const API_URL = 'https://api.anthropic.com/v1/messages';
const MAX_TOKENS = 500;
const MAX_MESSAGE_LEN = 1000;   // longueur max d'un message utilisateur
const MAX_HISTORY = 6;          // nb max de tours d'historique conservés

// Limiteur dédié : le chat coûte de l'argent → on borne par IP.
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: { error: "Trop de messages. Réessayez dans quelques minutes." },
});

/**
 * Consignes système : cadrent le ton, la langue et le périmètre.
 * On rappelle les faits clés du site pour des réponses fiables, et on
 * interdit d'inventer chiffres / tarifs / adresses.
 */
function systemPrompt(lang) {
  const langLine =
    lang === 'fr' ? "Réponds en FRANÇAIS." :
    lang === 'wo' ? "Réponds en WOLOF (orthographe francisée, celle qu'on tape au clavier)." :
    lang === 'en' ? "Answer in ENGLISH." :
    "Réponds TOUJOURS dans la langue du dernier message de l'utilisateur (français, wolof ou anglais).";

  return [
    "Tu es l'assistant virtuel de la SEN-CSU (Agence de la Couverture Sanitaire Universelle du Sénégal).",
    "Ton rôle : renseigner le public sur la couverture santé et les dispositifs sociaux du Sénégal.",
    langLine,
    "Style : bref (2 à 4 phrases), clair, poli et bienveillant. Pas de listes interminables.",
    "",
    "Faits fiables que tu peux utiliser :",
    "- CSU (Couverture Sanitaire Universelle) : adhésion via une mutuelle de santé communale, cotisation modique, couvre la famille inscrite.",
    "- Césarienne : GRATUITE dans les structures publiques (prise en charge par l'État).",
    "- Soins des enfants de 0 à 5 ans : GRATUITS dans les structures publiques.",
    "- Dialyse : prise en charge par l'État dans les centres agréés.",
    "- Plan Sésame : prise en charge des personnes âgées de 60 ans et plus.",
    "- PNBSF : les bénéficiaires sont automatiquement enrôlés dans la CSU.",
    "- Carte d'Égalité des Chances (CEC) : pour les personnes en situation de handicap.",
    "- Le site propose : localiser une agence, formulaire de contact, réclamation, offres d'emploi (Carrière).",
    "",
    "Règles :",
    "- N'invente JAMAIS de tarifs précis, de numéros de téléphone, d'adresses ni de statistiques. Si tu ne les connais pas, invite à contacter l'agence.",
    "- Ne donne pas de diagnostic ni de conseil médical personnel : oriente vers un professionnel de santé.",
    "- Si la question sort de ton domaine, dis-le poliment et propose la page Contact ou de localiser une agence.",
  ].join('\n');
}

// POST /api/chat  → Public (repli conversationnel)
router.post('/', chatLimiter, async (req, res) => {
  // Clé absente → le front conserve son repli local.
  if (!API_KEY) {
    return res.json({ configured: false, reply: null });
  }

  const { message, lang, history } = req.body || {};

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message requis.' });
  }
  const userMessage = message.trim().slice(0, MAX_MESSAGE_LEN);
  const language = ['fr', 'wo', 'en'].includes(lang) ? lang : 'auto';

  // Historique optionnel : on ne garde que les derniers tours, bornés.
  const safeHistory = Array.isArray(history)
    ? history
        .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-MAX_HISTORY)
        .map(m => ({ role: m.role, content: String(m.content).slice(0, MAX_MESSAGE_LEN) }))
    : [];

  const messages = [...safeHistory, { role: 'user', content: userMessage }];

  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: 0.3,
        system: systemPrompt(language),
        messages,
      }),
    });

    const json = await resp.json();

    if (!resp.ok || json.error) {
      const msg = (json.error && json.error.message) || `HTTP ${resp.status}`;
      console.error('Erreur API Claude:', msg);
      return res.status(502).json({ configured: true, reply: null, error: 'Assistant momentanément indisponible.' });
    }

    // Concatène les blocs texte de la réponse.
    const reply = Array.isArray(json.content)
      ? json.content.filter(b => b.type === 'text').map(b => b.text).join('').trim()
      : '';

    return res.json({ configured: true, reply: reply || null });
  } catch (err) {
    console.error('Erreur appel Claude:', err.message || err);
    return res.status(502).json({ configured: true, reply: null, error: 'Assistant momentanément indisponible.' });
  }
});

module.exports = router;
