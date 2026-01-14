const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

router.post('/', async (req, res) => {
  const { fullname, email, phone, message } = req.body;

  if (!fullname || !email || !message) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.verify();
    console.log('SMTP connecté ✅');

    const info = await transporter.sendMail({
      from: `"SEN-CSU" <${process.env.MAIL_USER}>`,
      to: 'contact@agencecmu.sn',
      subject: '📩 Nouveau message site SEN-CSU',
      html: `
        <h3>Nouveau message</h3>
        <p><b>Nom :</b> ${fullname}</p>
        <p><b>Email :</b> ${email}</p>
        <p><b>Téléphone :</b> ${phone || '-'}</p>
        <p><b>Message :</b><br>${message}</p>
      `,
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('Erreur mail ❌', err);
    res.status(500).json({ error: 'Erreur envoi email' });
  }
});

module.exports = router;
