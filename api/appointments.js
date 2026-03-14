import db from '../src/database';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const appointments = db.prepare(`
        SELECT a.*, c.name as client_name, c.whatsapp as client_whatsapp 
        FROM appointments a 
        JOIN clients c ON a.client_id = c.id
        ORDER BY a.date DESC, a.time DESC
      `).all();
      return res.status(200).json(appointments);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar agendamentos" });
    }
  }

  if (req.method === 'POST') {
    const { client_id, service, date, time, referrer_phone, consent, notifications } = req.body;
    try {
      const result = db.prepare("INSERT INTO appointments (client_id, service, date, time, referrer_phone, consent, notifications) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(client_id, service, date, time, referrer_phone, consent || 0, notifications || 0);
      return res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar agendamento" });
    }
  }

  if (req.method === 'PATCH') {
    const { id } = req.query;
    const { status } = req.body;
    try {
      db.prepare("UPDATE appointments SET status = ? WHERE id = ?").run(status, id);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar agendamento" });
    }
  }

  return res.status(405).end();
}
