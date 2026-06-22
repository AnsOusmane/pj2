// ====================================================================
// Génération du PDF récapitulatif d'une demande d'agrément (pdfkit).
// Polices standard intégrées (Helvetica) → encodage WinAnsi, compatible
// avec les accents français. Aucun fichier de police externe requis.
// ====================================================================
const PDFDocument = require('pdfkit');

const VERT = '#15803d';
const GRIS = '#555555';
const NOIR = '#111111';

/**
 * Construit le PDF récapitulatif et le résout en Buffer.
 * @param {object} d données du dépôt (voir route fournisseurs POST)
 * @returns {Promise<Buffer>}
 */
function buildAgrementPdf(d) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ---- En-tête ----
      doc.fontSize(20).fillColor(VERT).font('Helvetica-Bold').text('SEN-CSU');
      doc.fontSize(10).fillColor(GRIS).font('Helvetica')
        .text('Couverture Sanitaire Universelle');
      doc.moveDown(1);

      doc.fontSize(16).fillColor(NOIR).font('Helvetica-Bold')
        .text("Récapitulatif de demande d'agrément", { align: 'center' });
      doc.moveDown(0.4);
      doc.fontSize(12).fillColor(VERT).font('Helvetica-Bold')
        .text(`N° de dossier : ${d.numero}`, { align: 'center' });
      doc.fontSize(9).fillColor(GRIS).font('Helvetica')
        .text(`Déposée le ${d.date}`, { align: 'center' });
      doc.moveDown(1);

      // Filet séparateur
      doc.strokeColor('#dddddd').lineWidth(1)
        .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.8);

      // ---- Champs ----
      const champ = (label, valeur) => {
        doc.fontSize(9).fillColor(GRIS).font('Helvetica-Bold').text(label.toUpperCase());
        doc.fontSize(11).fillColor(NOIR).font('Helvetica').text(valeur && String(valeur).trim() ? valeur : '—');
        doc.moveDown(0.5);
      };

      champ('Raison sociale', d.raison_sociale);
      champ('Domaine', d.domaine);
      champ('NINEA', d.ninea);
      champ('RCCM', d.rccm);
      champ('Personne à contacter', d.contact_nom);
      champ('Téléphone', d.telephone);
      champ('Email', d.email);
      champ('Adresse', d.adresse);
      champ('Message', d.message);

      // ---- Documents fournis ----
      if (Array.isArray(d.documents) && d.documents.length) {
        doc.moveDown(0.5);
        doc.fontSize(9).fillColor(GRIS).font('Helvetica-Bold').text('DOCUMENTS FOURNIS');
        doc.moveDown(0.3);
        d.documents.forEach((doc_) => {
          doc.fontSize(10).fillColor(NOIR).font('Helvetica')
            .text(`• ${doc_.label} : ${doc_.nom || 'non fourni'}`);
        });
      }

      // ---- Pied de page ----
      doc.moveDown(1.5);
      doc.fontSize(8).fillColor(GRIS).font('Helvetica').text(
        "Ce document atteste l'enregistrement de votre demande. Il ne préjuge pas de la décision finale d'agrément. " +
        "Conservez votre numéro de dossier pour tout suivi.",
        { align: 'justify' }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { buildAgrementPdf };
