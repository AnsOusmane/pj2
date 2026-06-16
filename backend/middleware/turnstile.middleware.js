// Vérification anti-robot Cloudflare Turnstile.
// À placer AVANT multer sur les endpoints publics anonymes : on rejette les
// requêtes non vérifiées avant tout upload (pas de fichier poussé vers Cloudinary
// pour rien). Le token est envoyé par le front dans l'en-tête 'CF-Turnstile-Token'
// (et non dans le body, qui n'est pas encore parsé à ce stade).
//
// Variable d'env requise : TURNSTILE_SECRET (clé secrète Cloudflare).
// Par défaut, on utilise la clé de TEST Cloudflare qui valide toujours —
// pratique en dev, mais À REMPLACER par la vraie clé en production.
const SECRET = process.env.TURNSTILE_SECRET || '1x0000000000000000000000000000000AA';
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

async function verifyTurnstile(req, res, next) {
  const token = req.headers['cf-turnstile-token'];
  if (!token) {
    return res.status(400).json({ message: 'Vérification anti-robot manquante. Cochez la case avant d\'envoyer.' });
  }

  try {
    const resp = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: SECRET,
        response: token,
        remoteip: req.ip || ''
      })
    });
    const data = await resp.json();

    if (!data.success) {
      console.warn('Turnstile refusé:', data['error-codes']);
      return res.status(403).json({ message: 'Échec de la vérification anti-robot. Veuillez réessayer.' });
    }
    next();
  } catch (err) {
    console.error('Turnstile indisponible:', err.message);
    return res.status(502).json({ message: 'Vérification anti-robot momentanément indisponible. Réessayez.' });
  }
}

module.exports = verifyTurnstile;
