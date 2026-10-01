const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSetClause } = require('../utils/crud-helpers');

test('buildSetClause: construit un SET pour chaque champ présent, dans l\'ordre', () => {
  const { fields, values } = buildSetClause({ statut: 'lance', objet: 'Fournitures diverses' });

  assert.deepEqual(fields, ['statut = $1', 'objet = $2']);
  assert.deepEqual(values, ['lance', 'Fournitures diverses']);
});

test('buildSetClause: ignore les clés absentes de l\'objet (mise à jour partielle)', () => {
  // Simule ce que renvoie zod .partial().parse() quand seul un champ est fourni :
  // les clés non transmises n'apparaissent pas du tout dans l'objet.
  const { fields, values } = buildSetClause({ note_traitement: 'Dossier complet' });

  assert.deepEqual(fields, ['note_traitement = $1']);
  assert.deepEqual(values, ['Dossier complet']);
});

test('buildSetClause: renvoie des tableaux vides quand aucun champ n\'est fourni', () => {
  const { fields, values } = buildSetClause({});

  assert.deepEqual(fields, []);
  assert.deepEqual(values, []);
});

test('buildSetClause: les index restent corrects si l\'appelant continue à pousser des valeurs (is_published, file_url, updated_by...)', () => {
  const { fields, values } = buildSetClause({ objet: 'Marché de fournitures' });

  values.push(true);
  fields.push(`is_published = $${values.length}`);
  values.push('/uploads/x.pdf');
  fields.push(`file_url = $${values.length}`);

  assert.deepEqual(fields, ['objet = $1', 'is_published = $2', 'file_url = $3']);
  assert.deepEqual(values, ['Marché de fournitures', true, '/uploads/x.pdf']);
});

test('buildSetClause: préserve null explicite (distinct d\'un champ absent)', () => {
  const { fields, values } = buildSetClause({ ppm_id: null });

  assert.deepEqual(fields, ['ppm_id = $1']);
  assert.deepEqual(values, [null]);
});
