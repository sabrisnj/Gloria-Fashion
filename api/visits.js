import db from '../src/database';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const visits = db.prepare(`
        SELECT v.*, c.name as client_name, c.whatsapp as client_whatsapp 
        FROM visits v 
        JOIN clients c ON v.client_id = c.id
        ORDER BY v.created_at DESC
      `).all();
      return res.status(200).json(visits);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar visitas" });
    }
  }

  if (req.method === 'PATCH') {
    const { id } = req.query;
    const { status } = req.body;
    try {
      db.prepare("UPDATE visits SET status = ? WHERE id = ?").run(status, id);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar visita" });
    }
  }

  return res.status(405).end();
}
