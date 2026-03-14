import db from '../src/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { whatsapp } = req.body;
  const cleanWhatsapp = whatsapp ? String(whatsapp).replace(/\D/g, '') : '';

  try {
    const client = db.prepare("SELECT * FROM clients WHERE whatsapp = ?").get(cleanWhatsapp);
    
    if (!client) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    db.prepare("UPDATE clients SET last_access = CURRENT_TIMESTAMP WHERE id = ?").run(client.id);
    return res.status(200).json(client);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao realizar login" });
  }
}
