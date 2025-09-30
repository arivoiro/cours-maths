// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// --- CORS pour autoriser ton frontend Vercel ---
app.use(cors({
  origin: "https://maths-par-allan.vercel.app",
  credentials: true,
}));

// --- Body parser ---
app.use(bodyParser.json());

// --- SQLite ---
let db;
(async () => {
  db = await open({
    filename: "./data.db",
    driver: sqlite3.Database,
  });

  // Table contacts si elle n'existe pas
  await db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT,
      email TEXT,
      message TEXT
    )
  `);

  console.log("Connecté à SQLite");
})();

// --- Health check ---
app.get("/healthz", (req, res) => {
  res.send("OK");
});

// --- Login admin ---
app.post("/api/login", (req, res) => {
  const { password } = req.body;

  if (password === "pmaqolzs976431") {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
    return res.json({ token });
  }
  return res.status(401).json({ error: "Mot de passe incorrect" });
});

// --- Ajouter un contact ---
app.post("/api/contact", async (req, res) => {
  try {
    const { nom, email, message } = req.body;
    if (!nom || !email || !message) return res.status(400).json({ error: "Champs manquants" });

    const result = await db.run(
      "INSERT INTO contacts (nom, email, message) VALUES (?, ?, ?)",
      [nom, email, message]
    );
    res.json({ id: result.lastID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// --- Récupérer contacts (admin) ---
app.get("/api/contact", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(403).json({ error: "Token manquant" });

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== "admin") return res.status(403).json({ error: "Token invalide" });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const messages = await db.all("SELECT * FROM contacts LIMIT ? OFFSET ?", [limit, offset]);
    const total = (await db.get("SELECT COUNT(*) as count FROM contacts")).count;

    res.json({ messages, total });
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: "Token invalide" });
  }
});

// --- Start serveur ---
app.listen(PORT, () => {
  console.log(`Serveur backend en écoute sur le port ${PORT}`);
  console.log("==> Your service is live 🎉");
});
