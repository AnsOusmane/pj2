// Notification email via Web3Forms (https://web3forms.com) — aucun serveur SMTP requis.
// L'email part toujours vers l'adresse liée à la clé d'accès (la boîte de l'agence).
// La clé d'accès est "publique" mais on la garde en variable d'env pour la changer sans redeploy de code.
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY;

/**
 * Envoie une notification à l'agence via Web3Forms.
 * @param {object}  opts
 * @param {string}  opts.subject    Sujet de l'email.
 * @param {string} [opts.from_name] Nom d'expéditeur affiché (défaut "SEN-CSU").
 * @param {string} [opts.replyto]   Adresse de réponse (ex. email du fournisseur).
 * @param {object}  opts.fields     Champs libres affichés dans le corps (clé = libellé).
 */
async function sendNotification({ subject, from_name, replyto, fields = {} }) {
  if (!ACCESS_KEY) {
    console.warn('WEB3FORMS_ACCESS_KEY absente : notification non envoyée.');
    return;
  }

  const resp = await fetch(WEB3FORMS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: ACCESS_KEY,
      subject,
      from_name: from_name || 'SEN-CSU',
      ...(replyto ? { replyto } : {}),
      ...fields,
    }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!data.success) {
    throw new Error(data.message || `Web3Forms a renvoyé une erreur (HTTP ${resp.status})`);
  }
  return data;
}

module.exports = { sendNotification };
