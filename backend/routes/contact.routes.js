const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const { z } = require('zod');
const rateLimit = require('express-rate-limit');

// Anti-spam
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Trop de messages envoyés. Veuillez réessayer plus tard." }
});

const contactSchema = z.object({
  fullname: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message trop court (minimum 10 caractères)")
});

router.post('/', contactLimiter, async (req, res) => {
  try {
    const data = contactSchema.parse(req.body);

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

    const info = await transporter.sendMail({
      from: `"SEN-CSU" <${process.env.MAIL_USER}>`,
      to: 'contact@agencecmu.sn',
      replyTo: data.email,
      subject: `📩 Nouveau message de ${data.fullname}`,
      html: `
        <h3>Nouveau message</h3>
        <p><b>Nom :</b> ${data.fullname}</p>
        <p><b>Email :</b> ${data.email}</p>
        <p><b>Téléphone :</b> ${data.phone || '-'}</p>
        <p><b>Message :</b><br>${data.message}</p>
      `,
    });

    console.log('Message envoyé ✅', info.messageId);
    res.json({ success: true, messageId: info.messageId });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Données invalides',
        errors: err.errors 
      });
    }

    console.error('Erreur mail ❌', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message'
    });
  }
});

module.exports = router;