import db from '../src/database';

export default async function handler(req, res) {
  const { client_id } = req.query;

  if (!client_id) return res.status(400).json({ error: "ID do cliente é obrigatório" });

  try {
    const appointments = db.prepare("SELECT * FROM appointments WHERE client_id = ? ORDER BY date DESC").all(client_id);
    const vouchers = db.prepare("SELECT * FROM vouchers WHERE client_id = ?").all(client_id);
    
    return res.status(200).json({ appointments, vouchers });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar dados do cliente" });
  }
}
