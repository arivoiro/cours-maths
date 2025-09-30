const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// SQLite
const db = new sqlite3.Database("./db.sqlite", (err) => {
  if (err) console.error("Erreur SQLite:", err);
  else console.log("Connecté à SQLite");
});

// --- ROUTE RACINE ---
app.get("/", (req, res) => {
  res.send("Backend actif ✅ Utilisez les routes /api/login et /api/contact");
});

// --- Health check ---
app.get("/healthz", (req, res) => res.send("OK"));

// --- Login admin ---
app.post("/api/login", (req, res) => {
  const { password } = req.body;
  if (password === "pmaqolzs976431") {
    const token = jwt.sign({ role: "admin" }, "secret", { expiresIn: "2h" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Mot de passe incorrect" });
  }
});

// --- Ajouter contact ---
app.post("/api/contact", (req, res) => {
  const { nom, email, message } = req.body;
  if (!nom || !email || !message) return res.status(400).json({ error: "Champs manquants" });

  db.run(
    "INSERT INTO contacts (nom, email, message) VALUES (?, ?, ?)",
    [nom, email, message],
    function (err) {
      if (err) return res.status(500).json({ error: "Erreur DB" });
      res.json({ id: this.lastID });
    }
  );
});

// --- Récupérer contacts (admin) ---
app.get("/api/contact", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(403).json({ error: "Token manquant" });

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "secret");
    if (decoded.role !== "admin") return res.status(403).json({ error: "Accès refusé" });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    db.all("SELECT * FROM contacts LIMIT ? OFFSET ?", [limit, offset], (err, rows) => {
      if (err) return res.status(500).json({ error: "Erreur DB" });
      db.get("SELECT COUNT(*) AS total FROM contacts", (err2, totalRow) => {
        if (err2) return res.status(500).json({ error: "Erreur DB" });
        res.json({ messages: rows, total: totalRow.total });
      });
    });
  } catch (e) {
    return res.status(403).json({ error: "Token invalide" });
  }
});

app.listen(port, () => {
  console.log(`Serveur backend en écoute sur le port ${port}`);
});
