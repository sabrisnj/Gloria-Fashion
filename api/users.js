import db from '../src/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const clients = db.prepare("SELECT * FROM clients ORDER BY last_access DESC").all();
    return res.status(200).json(clients);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar usuários" });
  }
}
