// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import jwt from "jsonwebtoken";

const app = express();
const port = process.env.PORT || 10000;

// -----------------
// Middleware
// -----------------
app.use(bodyParser.json());

// CORS pour ton frontend Vercel
app.use(cors({
  origin: "https://maths-par-allan.vercel.app"
}));

// -----------------
// Database (SQLite)
// -----------------
const db = new sqlite3.Database("./contacts.db", (err) => {
  if (err) return console.error(err.message);
  console.log("Connecté à SQLite");
});

// Créer table contacts si elle n'existe pas
db.run(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT,
    email TEXT,
    message TEXT
  )
`);

// -----------------
// Routes
// -----------------

// Health check
app.get("/healthz", (req, res) => {
  res.send("OK");
});

// Login admin
app.post("/api/login", (req, res) => {
  const { password } = req.body;
  if (password === "pmaqolzs976431") {
    const token = jwt.sign({ role: "admin" }, "SECRET_KEY", { expiresIn: "24h" });
    return res.json({ token });
  }
  res.status(401).json({ error: "Mot de passe incorrect" });
});

// Ajouter un contact
app.post("/api/contact", (req, res) => {
  const { nom, email, message } = req.body;
  if (!nom || !email || !message) return res.status(400).json({ error: "Champs manquants" });

  db.run(
    "INSERT INTO contacts (nom, email, message) VALUES (?, ?, ?)",
    [nom, email, message],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Récupérer contacts (admin uniquement)
app.get("/api/contact", (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Token manquant" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    if (decoded.role !== "admin") throw new Error("Non autorisé");
  } catch (err) {
    return res.status(403).json({ error: "Token invalide" });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.all("SELECT * FROM contacts LIMIT ? OFFSET ?", [limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    db.get("SELECT COUNT(*) as total FROM contacts", (err, countRow) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ messages: rows, total: countRow.total });
    });
  });
});

// -----------------
// Start server
// -----------------
app.listen(port, "0.0.0.0", () => {
  console.log(`Serveur backend en écoute sur le port ${port}`);
});
