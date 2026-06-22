// ====================================================================
// Mailer SMTP (Nodemailer) — provider-agnostique (Brevo, Gmail, etc.)
// --------------------------------------------------------------------
// Configuré uniquement par variables d'environnement (jamais en dur :
// le mot de passe SMTP est un secret, il vit dans .env / Render) :
//   SMTP_HOST   ex. smtp-relay.brevo.com
//   SMTP_PORT   587 (STARTTLS) ou 465 (SSL)   — défaut 587
//   SMTP_USER   identifiant SMTP
//   SMTP_PASS   clé/mot de passe SMTP
//   MAIL_FROM   expéditeur affiché, ex. "SEN-CSU <no-reply@sencsu.sn>"
//
// Si la config est absente, sendMail devient un no-op silencieux : aucune
// fonctionnalité n'est cassée tant que le SMTP n'est pas renseigné.
// ====================================================================
const nodemailer = require('nodemailer');

const configured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;
if (configured) {
  const port = Number(process.env.SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 = SSL implicite ; sinon STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

/**
 * Envoie un email. Best-effort : renvoie false (sans lever) si le SMTP
 * n'est pas configuré, pour ne jamais bloquer le flux appelant.
 * @param {import('nodemailer').SendMailOptions} opts
 * @returns {Promise<boolean>} true si l'email a été remis au serveur SMTP
 */
async function sendMail(opts) {
  if (!transporter) {
    console.warn('[mailer] SMTP non configuré (SMTP_HOST/USER/PASS) — email ignoré.');
    return false;
  }
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  await transporter.sendMail({ from, ...opts });
  return true;
}

module.exports = { sendMail, mailerConfigured: configured };
