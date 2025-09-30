require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Variables d'environnement
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const SECRET_KEY = process.env.SECRET_KEY;

// Création dossier /tmp si nécessaire (Render a déjà /tmp mais sécurité)
if (!fs.existsSync("/tmp")) fs.mkdirSync("/tmp");

// Chemins pour DB et logs
const dbPath = path.join("/tmp", "database.db");
const logPath = path.join("/tmp", "logs.txt");

// Fonction de log
function logAction(action) {
  fs.appendFileSync(logPath, `${new Date().toISOString()} - ${action}\n`);
}

// ---------------------- Serveur ----------------------
const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------- Sécurité ----------------------
app.use(helmet());
app.use(cors());
app.use(express.json()); // Express 5 : parse JSON

// Middleware debug pour body
app.use((req, res, next) => {
  console.log("Body reçu:", req.body);
  next();
});

// Limiteur login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Trop de tentatives, réessayez plus tard."
});

// ---------------------- Routes Login ----------------------
app.post("/api/login", loginLimiter, async (req, res) => {
  const { password } = req.body;

  if (!ADMIN_PASSWORD_HASH || !SECRET_KEY) {
    logAction("Erreur config serveur : admin hash ou secret manquant");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  if (!password) {
    logAction("Login échoué : mot de passe manquant");
    return res.status(400).json({ error: "Mot de passe manquant" });
  }

  const match = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!match) {
    logAction(`Login échoué pour mot de passe: ${password}`);
    return res.status(401).json({ error: "Mot de passe invalide" });
  }

  const token = jwt.sign({ role: "admin" }, SECRET_KEY, { expiresIn: "2h" });
  logAction("Login réussi pour admin");
  res.json({ token });
});

// ---------------------- Middleware token ----------------------
function verifyToken(req, res, next) {
  if (!SECRET_KEY) {
    logAction("Erreur config serveur: SECRET_KEY manquant");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    logAction("Accès non autorisé: token manquant");
    return res.status(401).json({ error: "Token manquant" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    logAction("Accès non autorisé: token manquant dans Authorization");
    return res.status(401).json({ error: "Token manquant" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      logAction("Token invalide détecté");
      return res.status(403).json({ error: "Token invalide" });
    }
    req.user = decoded;
    next();
  });
}

// ---------------------- Database ----------------------
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error(err.message);
  else console.log("Connecté à SQLite");
});

// Créer table contacts si n'existe pas
db.run(`CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT,
  email TEXT,
  message TEXT
)`);

// ---------------------- API Contacts ----------------------
// POST contact public
app.post(
  "/api/contact",
  body("nom").isLength({ min: 1 }).trim().escape(),
  body("email").isEmail().normalizeEmail(),
  body("message").isLength({ min: 1 }).trim().escape(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logAction(`Validation échouée contact: ${JSON.stringify(errors.array())}`);
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

// GET contacts admin
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

// DELETE contact admin
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
  res.send("OK");
});

// ---------------------- Servir Frontend React ----------------------
const buildPath = path.join(__dirname, "../build");
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// ---------------------- Lancement ----------------------
app.listen(PORT, () => {
  console.log(`Serveur backend en écoute sur le port ${PORT}`);
  logAction(`Serveur démarré sur le port ${PORT}`);
});
