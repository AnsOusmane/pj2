const test = require('node:test');
const assert = require('node:assert/strict');
const requirePermission = require('../middleware/permission.middleware');

// Fabrique une paire (req, res) minimale pour tester le middleware sans
// dépendre d'Express : requirePermission ne lit/écrit que req.user et res.
function makeReqRes(user) {
  const req = { user };
  const res = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; }
  };
  return { req, res };
}

test('requirePermission: laisse passer un admin, même sans la permission listée', () => {
  const { req, res } = makeReqRes({ role: 'admin', permissions: [] });
  let nextCalled = false;

  requirePermission('ppm')(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});

test('requirePermission: laisse passer un utilisateur qui a la permission exacte', () => {
  const { req, res } = makeReqRes({ role: 'user', permissions: ['ppm', 'candidatures'] });
  let nextCalled = false;

  requirePermission('ppm')(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
});

test('requirePermission: bloque avec 403 un utilisateur qui n\'a pas la permission', () => {
  const { req, res } = makeReqRes({ role: 'user', permissions: ['candidatures'] });
  let nextCalled = false;

  requirePermission('ppm')(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
});

test('requirePermission: bloque un utilisateur sans aucune permission (tableau absent)', () => {
  const { req, res } = makeReqRes({ role: 'user' }); // permissions undefined
  let nextCalled = false;

  requirePermission('ppm')(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
});

test('requirePermission: bloque quand req.user est absent (pas de session)', () => {
  const { req, res } = makeReqRes(undefined);
  let nextCalled = false;

  requirePermission('ppm')(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
});
