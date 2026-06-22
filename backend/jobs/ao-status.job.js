// ====================================================================
// Job — Pilotage automatique du statut des appels d'offres par les dates
// --------------------------------------------------------------------
// Cycle de vie piloté par les dates (TIMESTAMPTZ, précision minute) :
//   « à venir »  → date_lancement atteinte → « ouvert »
//   « ouvert »   → date_limite dépassée    → « clôturé »
//
// Le balayage est strictement *progressif* (jamais de retour en arrière)
// et idempotent : on peut le relancer autant qu'on veut sans effet de bord.
//
// Déclenché de trois façons complémentaires (aucune dépendance externe) :
//   • au démarrage du serveur (rattrapage après veille / redéploiement),
//   • toutes les heures via setInterval,
//   • paresseusement à chaque consultation des listes (throttlé à 1/min),
//     ce qui garantit des statuts à jour même si l'hébergeur met l'app en veille.
// ====================================================================
const { pool } = require('../db');

let lastRun = 0;
let running = false;

/**
 * Réconcilie les statuts des appels d'offres avec leurs dates.
 * @returns {Promise<number>} nombre de lignes lancées + clôturées
 */
async function sweepAoStatuses() {
  if (running) return 0; // évite les exécutions concurrentes (intervalle + lecture)
  running = true;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1) Lancement automatique : « à venir » → « ouvert »
    //    (date de lancement atteinte, date limite pas encore dépassée).
    const launched = await client.query(
      `UPDATE appels_offre
          SET statut = 'ouvert', updated_at = CURRENT_TIMESTAMP
        WHERE archived_at IS NULL
          AND statut = 'a_venir'
          AND date_lancement IS NOT NULL
          AND date_lancement <= NOW()
          AND (date_limite IS NULL OR date_limite >= NOW())`
    );

    // 2) Clôture automatique : date limite dépassée → « clôturé ».
    const closed = await client.query(
      `UPDATE appels_offre
          SET statut = 'cloture', updated_at = CURRENT_TIMESTAMP
        WHERE archived_at IS NULL
          AND statut IN ('a_venir', 'ouvert')
          AND date_limite IS NOT NULL
          AND date_limite < NOW()`
    );

    // 3) Synchro PPM : toute ligne PPM encore « prévu » mais dont l'appel
    //    d'offres lié est désormais lancé (ouvert/clôturé) passe « lancé ».
    //    Formulation par état (et non par transition) : idempotente et
    //    robuste quel que soit le chemin (création, édition, balayage).
    await client.query(
      `UPDATE ppm SET statut = 'lance', updated_at = CURRENT_TIMESTAMP
        WHERE statut = 'prevu'
          AND id IN (
            SELECT ppm_id FROM appels_offre
             WHERE ppm_id IS NOT NULL
               AND archived_at IS NULL
               AND statut IN ('ouvert', 'cloture')
          )`
    );

    await client.query('COMMIT');
    const n = launched.rowCount + closed.rowCount;
    if (n > 0) {
      console.log(`[ao-status] ${launched.rowCount} lancé(s), ${closed.rowCount} clôturé(s)`);
    }
    lastRun = Date.now();
    return n;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (_) { /* pas de tx active */ }
    console.error('[ao-status] échec du balayage:', err.message);
    return 0;
  } finally {
    client.release();
    running = false;
  }
}

/** Balayage paresseux : déclenché par les lectures, au plus une fois par minute. */
async function lazySweep() {
  if (Date.now() - lastRun < 60 * 1000) return;
  await sweepAoStatuses();
}

/** Planifie le balayage : une fois au démarrage, puis toutes les heures. */
function scheduleAoStatusSweep() {
  sweepAoStatuses();
  setInterval(sweepAoStatuses, 60 * 60 * 1000).unref();
}

module.exports = { sweepAoStatuses, lazySweep, scheduleAoStatusSweep };
