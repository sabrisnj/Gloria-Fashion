import express from "express";
import { createServer as createViteServer } from "vite";
import db from "./src/database.ts";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Auth / Client Registration
  app.post("/api/auth/client", (req, res) => {
    const { name, whatsapp } = req.body;
    try {
      const existing = db.prepare("SELECT * FROM clients WHERE whatsapp = ?").get(whatsapp);
      if (existing) {
        db.prepare("UPDATE clients SET last_access = CURRENT_TIMESTAMP WHERE id = ?").run(existing.id);
        return res.json(existing);
      }
      const result = db.prepare("INSERT INTO clients (name, whatsapp) VALUES (?, ?)").run(name, whatsapp);
      const newUser = db.prepare("SELECT * FROM clients WHERE id = ?").get(result.lastInsertRowid);
      res.json(newUser);
    } catch (error) {
      res.status(500).json({ error: "Erro ao autenticar cliente" });
    }
  });

  // Products
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/admin/products", (req, res) => {
    const { name, description, price, category, image_url } = req.body;
    const result = db.prepare("INSERT INTO products (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)")
      .run(name, description, price, category, image_url);
    res.json({ id: result.lastInsertRowid });
  });

  // Appointments
  app.get("/api/appointments", (req, res) => {
    const appointments = db.prepare(`
      SELECT a.*, c.name as client_name, c.whatsapp as client_whatsapp 
      FROM appointments a 
      JOIN clients c ON a.client_id = c.id
      ORDER BY a.date DESC, a.time DESC
    `).all();
    res.json(appointments);
  });

  app.post("/api/appointments", (req, res) => {
    const { client_id, service, date, time, referrer_phone, consent, notifications } = req.body;
    const result = db.prepare("INSERT INTO appointments (client_id, service, date, time, referrer_phone, consent, notifications) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(client_id, service, date, time, referrer_phone, consent || 0, notifications || 0);
    res.json({ id: result.lastInsertRowid });
  });

  app.patch("/api/admin/appointments/:id", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE appointments SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  // Vouchers
  app.get("/api/vouchers/:client_id", (req, res) => {
    const vouchers = db.prepare("SELECT * FROM vouchers WHERE client_id = ?").all(req.params.client_id);
    res.json(vouchers);
  });

  // Check-in
  app.post("/api/check-in", (req, res) => {
    const { client_id, referrer_phone, referral_code, is_manual } = req.body;
    const status = is_manual ? 'pendente' : 'confirmado';
    
    const result = db.prepare("INSERT INTO visits (client_id, referral_code, status) VALUES (?, ?, ?)")
      .run(client_id, referral_code || null, status);
    
    // Referral logic
    if (referral_code && referral_code.startsWith('GLORIA-')) {
      const referrerId = parseInt(referral_code.split('-')[1]);
      if (!isNaN(referrerId)) {
        db.prepare("INSERT INTO vouchers (client_id, code, description, discount) VALUES (?, ?, ?, ?)")
          .run(referrerId, 'INDICA5', 'Voucher de Indicação', 5);
      }
    } else if (referrer_phone) {
      const referrer = db.prepare("SELECT id FROM clients WHERE whatsapp = ?").get(referrer_phone);
      if (referrer) {
        db.prepare("INSERT INTO vouchers (client_id, code, description, discount) VALUES (?, ?, ?, ?)")
          .run(referrer.id, 'INDICA5', 'Voucher de Indicação', 5);
      }
    }
    
    // Give visit voucher for confirmed check-ins
    if (!is_manual) {
      db.prepare("INSERT INTO vouchers (client_id, code, description, discount) VALUES (?, ?, ?, ?)")
        .run(client_id, 'VISITA5', 'Voucher de Visita', 5);
    }
      
    res.json({ success: true, id: result.lastInsertRowid, status });
  });

  app.get("/api/admin/visits", (req, res) => {
    const visits = db.prepare(`
      SELECT v.*, c.name as client_name, c.whatsapp as client_whatsapp 
      FROM visits v 
      JOIN clients c ON v.client_id = c.id
      ORDER BY v.created_at DESC
    `).all();
    res.json(visits);
  });

  app.patch("/api/admin/visits/:id", (req, res) => {
    const { status } = req.body;
    const visit = db.prepare("SELECT * FROM visits WHERE id = ?").get(req.params.id);
    
    if (visit && status === 'confirmado' && visit.status === 'pendente') {
      // Logic to give vouchers when manual check-in is approved
      db.prepare("INSERT INTO vouchers (client_id, code, description, discount) VALUES (?, ?, ?, ?)")
        .run(visit.client_id, 'VISITA5', 'Voucher de Visita (Manual)', 5);
        
      if (visit.referral_code) {
        if (visit.referral_code.startsWith('GLORIA-')) {
          const referrerId = parseInt(visit.referral_code.split('-')[1]);
          if (!isNaN(referrerId)) {
            db.prepare("INSERT INTO vouchers (client_id, code, description, discount) VALUES (?, ?, ?, ?)")
              .run(referrerId, 'INDICA5', 'Voucher de Indicação (Manual)', 5);
          }
        } else {
          const referrer = db.prepare("SELECT id FROM clients WHERE whatsapp = ?").get(visit.referral_code);
          if (referrer) {
            db.prepare("INSERT INTO vouchers (client_id, code, description, discount) VALUES (?, ?, ?, ?)")
              .run(referrer.id, 'INDICA5', 'Voucher de Indicação (Manual)', 5);
          }
        }
      }
    }
    
    db.prepare("UPDATE visits SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  // Store Info
  app.get("/api/store-info", (req, res) => {
    const info = db.prepare("SELECT * FROM store_info").all();
    const result = info.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    res.json(result);
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
