import db from '../src/database';

export default async function handler(req, res) {
  const { client_id } = req.query;
  
  if (req.method === 'GET') {
    if (!client_id) return res.status(400).json({ error: "Client ID é obrigatório" });
    try {
      const vouchers = db.prepare("SELECT * FROM vouchers WHERE client_id = ?").all(client_id);
      return res.status(200).json(vouchers);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar vouchers" });
    }
  }

  return res.status(405).end();
}
