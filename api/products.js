import db from '../src/database';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const products = db.prepare("SELECT * FROM products").all();
      return res.status(200).json(products);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar produtos" });
    }
  }
  
  if (req.method === 'POST') {
    const { name, description, price, category, image_url } = req.body;
    try {
      const result = db.prepare("INSERT INTO products (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)")
        .run(name, description, price, category, image_url);
      return res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar produto" });
    }
  }

  return res.status(405).end();
}
