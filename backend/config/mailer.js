const nodemailer = require('nodemailer');

// Adresse interne qui reçoit les notifications (dépôts d'agrément, contacts…).
const AGENCY_EMAIL = process.env.MAIL_TO || 'ansoumana.ndiaye-external@sencsu.sn';

// Transporteur réutilisé (on évite d'en recréer un à chaque envoi).
let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
  return transporter;
}

/** Envoi générique. `from` est déjà positionné sur l'expéditeur SEN-CSU. */
async function sendMail(opts) {
  const t = getTransporter();
  return t.sendMail({ from: `"SEN-CSU" <${process.env.MAIL_USER}>`, ...opts });
}

module.exports = { sendMail, AGENCY_EMAIL };
