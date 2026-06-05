const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const { z } = require('zod');
const rateLimit = require('express-rate-limit');

// ====================== RATE LIMITING (anti-spam) ======================
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5,                   // maximum 5 messages par heure par IP
  message: { success: false, message: "Trop de messages envoyés. Veuillez réessayer plus tard." },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================== VALIDATION ======================
const contactSchema = z.object({
  fullname: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères")
});

// ====================== ROUTE ======================
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
      from: `"SEN-CSU - Formulaire Contact" <${process.env.MAIL_USER}>`,
      to: 'contact@agencecmu.sn',
      replyTo: data.email,
      subject: `📩 Nouveau message de ${data.fullname}`,
      html: `
        <h3>Nouveau message via le site</h3>
        <p><strong>Nom :</strong> ${data.fullname}</p>
        <p><strong>Email :</strong> ${data.email}</p>
        <p><strong>Téléphone :</strong> ${data.phone || 'Non renseigné'}</p>
        <p><strong>Message :</strong></p>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
        <hr>
        <small>Envoyé le ${new Date().toLocaleString('fr-FR')}</small>
      `,
    });

    console.log('Email envoyé avec succès:', info.messageId);
    res.json({ 
      success: true, 
      message: 'Votre message a été envoyé avec succès.' 
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Données invalides', 
        errors: err.errors 
      });
    }

    console.error('Erreur envoi email:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'envoi du message. Veuillez réessayer.' 
    });
  }
});

module.exports = router;