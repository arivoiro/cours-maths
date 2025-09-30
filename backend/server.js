require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

// Routes et middleware import
const loginRouter = require("./api/login");
const verifyToken = require("./api/middleware");

const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000; // Render fournit le port via process.env.PORT

// ---------------------- Sécurité ----------------------
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Limiteur pour login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: "Trop de tentatives, réessayez plus tard."
});
app.use("/api/login", loginLimiter);

// ---------------------- Logs ----------------------
function logAction(action) {
  const logPath = path.join("/tmp", "logs.txt"); // stocke logs dans /tmp
  fs.appendFileSync(logPath, `${new Date().toISOString()} - ${action}\n`);
}

// ---------------------- Routes ----------------------
// Login
app.use("/api/login", loginRouter);

// ---------------------- Database ----------------------
const dbPath = path.join("/tmp", "database.db"); // stocke la DB dans /tmp
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error(err.message);
  else console.log("Connecté à SQLite");
});

// Create table contacts if they do not exist
db.run(`CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT,
  email TEXT,
  message TEXT
)`);

// ---------------------- API Contacts ----------------------

// Ajouter un contact (public) avec validation
app.post(
  "/api/contact",
  body("nom").isLength({ min: 1 }).trim().escape(),
  body("email").isEmail().normalizeEmail(),
  body("message").isLength({ min: 1 }).trim().escape(),
  (req, res) => {
    if (!req.body) {
      logAction("Body vide reçu");
      return res.status(400).json({ error: "Body vide" });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logAction(`Validation échouée pour contact: ${JSON.stringify(errors.array())}`);
      return res.status(400).json({ errors: errors.array() });
    }

    const { nom, email, message } = req.body;
    db.run(
      `INSERT INTO contacts (nom, email, message) VALUES (?, ?, ?)`,
      [nom, email, message],
      function (err) {
        if (err) {
          logAction(`Erreur ajout message: ${err.message}`);
          return res.status(500).json({ error: err.message });
        }
        logAction(`Nouveau message ajouté (ID: ${this.lastID})`);
        res.json({ id: this.lastID });
      }
    );
  }
);

// Récupérer tous les contacts (admin) avec pagination
app.get("/api/contact", verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  db.get(`SELECT COUNT(*) as total FROM contacts`, (countErr, countRow) => {
    if (countErr) {
      logAction(`Erreur comptage messages: ${countErr.message}`);
      return res.status(500).json({ error: countErr.message });
    }

    const total = countRow.total;

    db.all(
      `SELECT * FROM contacts ORDER BY id DESC LIMIT ? OFFSET ?`,
      [limit, offset],
      (err, rows) => {
        if (err) {
          logAction(`Erreur récupération messages: ${err.message}`);
          return res.status(500).json({ error: err.message });
        }
        logAction(`Messages récupérés pour admin (page ${page}, limit ${limit})`);
        res.json({ messages: rows, total });
      }
    );
  });
});

// Supprimer un message par ID (admin)
app.delete("/api/contact/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM contacts WHERE id = ?`, [id], function (err) {
    if (err) {
      logAction(`Erreur suppression message ID ${id}: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    logAction(`Message ID ${id} supprimé par admin`);
    res.json({ deletedId: id });
  });
});

// ---------------------- Health Check ----------------------
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

// ---------------------- Lancement serveur ----------------------
app.listen(PORT, () => {
  console.log(`Serveur backend en écoute sur le port ${PORT}`);
  logAction(`Serveur démarré sur le port ${PORT}`);
});
