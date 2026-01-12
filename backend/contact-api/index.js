import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Charger le .env

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/contact", async (req, res) => {
  console.log("Body reçu :", req.body); // 🔹 Pour debug Angular -> Node

  const { fullname, email, phone, message } = req.body;

  if (!fullname || !email || !message) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true si port 465
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // Mot de passe d'application Gmail
      },
    });

    // 🔹 Vérifier la connexion SMTP avant l'envoi
    await transporter.verify();
    console.log("SMTP connecté ✅");

    const info = await transporter.sendMail({
      from: `"SEN-CSU" <${process.env.MAIL_USER}>`,
      to: "ansouousmanendiaye@gmail.com",
      subject: "📩 Nouveau message site SEN-CSU",
      html: `
        <h3>Nouveau message</h3>
        <p><b>Nom :</b> ${fullname}</p>
        <p><b>Email :</b> ${email}</p>
        <p><b>Téléphone :</b> ${phone || "-"}</p>
        <p><b>Message :</b><br>${message}</p>
      `,
    });

    console.log("Email envoyé :", info.messageId);
    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error("Erreur Nodemailer :", err);
    res.status(500).json({
      error: "Erreur envoi email",
      details: err.message || err.toString(),
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Contact lancée sur http://localhost:${PORT}`);
});
