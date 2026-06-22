// ====================================================================
// Confirmation au fournisseur après dépôt d'une demande d'agrément.
// Envoie un email de confirmation contenant un message, le récapitulatif
// de la demande, et le même récapitulatif en pièce jointe PDF.
// Best-effort : toute erreur est journalisée mais jamais propagée
// (l'enregistrement du dépôt ne doit pas dépendre de l'email).
// ====================================================================
const { sendMail } = require('../config/mailer');
const { buildAgrementPdf } = require('../utils/agrement-pdf');

// Échappement minimal pour l'injection des valeurs dans le HTML de l'email.
const esc = (s) =>
  String(s ?? '—').replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function buildHtml(d) {
  const ligne = (label, valeur) => `
    <tr>
      <td style="padding:6px 10px;color:#555;font-size:13px;white-space:nowrap;">${esc(label)}</td>
      <td style="padding:6px 10px;color:#111;font-size:13px;font-weight:600;">${esc(valeur)}</td>
    </tr>`;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;color:#111;">
    <div style="background:#15803d;color:#fff;padding:18px 22px;border-radius:10px 10px 0 0;">
      <div style="font-size:20px;font-weight:bold;">SEN-CSU</div>
      <div style="font-size:12px;opacity:.9;">Couverture Sanitaire Universelle</div>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;padding:22px;border-radius:0 0 10px 10px;">
      <p style="font-size:15px;">Bonjour${d.contact_nom ? ' ' + esc(d.contact_nom) : ''},</p>
      <p style="font-size:14px;line-height:1.6;">
        Nous accusons réception de votre <strong>demande d'agrément</strong> auprès de la SEN-CSU.
        Elle a bien été enregistrée et sera examinée par nos services. Vous serez recontacté(e)
        à l'adresse ou au numéro fournis.
      </p>
      <p style="font-size:14px;line-height:1.6;">
        Numéro de dossier :
        <strong style="color:#15803d;">${esc(d.numero)}</strong>
        — déposé le ${esc(d.date)}.<br/>
        Merci de le conserver pour tout suivi.
      </p>

      <h3 style="font-size:14px;color:#15803d;margin:20px 0 6px;">Récapitulatif de votre demande</h3>
      <table style="width:100%;border-collapse:collapse;background:#f0fdf4;border-radius:8px;">
        ${ligne('Raison sociale', d.raison_sociale)}
        ${ligne('Domaine', d.domaine)}
        ${ligne('NINEA', d.ninea)}
        ${ligne('RCCM', d.rccm)}
        ${ligne('Personne à contacter', d.contact_nom)}
        ${ligne('Téléphone', d.telephone)}
        ${ligne('Email', d.email)}
        ${ligne('Adresse', d.adresse)}
      </table>

      <p style="font-size:13px;color:#555;margin-top:16px;line-height:1.6;">
        Le récapitulatif complet est également joint à cet email au format PDF.
      </p>
      <p style="font-size:12px;color:#888;margin-top:18px;">
        Cet email est envoyé automatiquement, merci de ne pas y répondre directement.
      </p>
    </div>
  </div>`;
}

/**
 * @param {object} d données du dépôt (numero, date, raison_sociale, email, …, documents[])
 * @returns {Promise<boolean>} true si l'email a été envoyé
 */
async function sendAgrementConfirmation(d) {
  if (!d || !d.email) return false; // pas d'email fourni → rien à envoyer

  const pdf = await buildAgrementPdf(d);
  return sendMail({
    to: d.email,
    subject: `Confirmation de votre demande d'agrément — ${d.numero}`,
    html: buildHtml(d),
    attachments: [
      { filename: `recap-agrement-${d.numero}.pdf`, content: pdf, contentType: 'application/pdf' }
    ]
  });
}

module.exports = { sendAgrementConfirmation };
