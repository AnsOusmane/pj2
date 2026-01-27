import { db } from './db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const [rows] = await db.query('SELECT * FROM users');
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { name, email } = req.body;
    await db.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );
    return res.status(201).json({ success: true });
  }

  res.status(405).end();
}
