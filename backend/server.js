require("dotenv").config();
const express = require("express");
const cors = require("cors");
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
const PORT = process.env.PORT || 5000;

// ---------------------- Sécurité ----------------------
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Limiteur pour login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Trop de tentatives, réessayez plus tard."
});
app.use("/api/login", loginLimiter);

// ---------------------- Logs ----------------------
function logAction(action) {
  const logPath = path.join("/tmp", "logs.txt");
  fs.appendFileSync(logPath, `${new Date().toISOString()} - ${action}\n`);
}

// ---------------------- Routes ----------------------
app.use("/api/login", loginRouter);

// ---------------------- Database ----------------------
const dbPath = path.join("/tmp", "database.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error(err.message);
  else console.log("Connecté à SQLite");
});

db.run(`CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT,
  email TEXT,
  message TEXT
)`);

// ---------------------- API Contacts ----------------------
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

app.get("/api/contact", verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  db.get(`SELECT COUNT(*) as total FROM contacts`, (countErr, countRow) => {
    if (countErr) return res.status(500).json({ error: countErr.message });

    const total = countRow.total;
    db.all(
      `SELECT * FROM contacts ORDER BY id DESC LIMIT ? OFFSET ?`,
      [limit, offset],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ messages: rows, total });
      }
    );
  });
});

app.delete("/api/contact/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM contacts WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deletedId: id });
  });
});

// ---------------------- SERVIR FRONTEND ----------------------
const buildPath = path.join(__dirname, "../build");
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// ---------------------- Lancement serveur ----------------------
app.listen(PORT, () => {
  console.log(`Serveur backend en écoute sur le port ${PORT}`);
  logAction(`Serveur démarré sur le port ${PORT}`);
});
