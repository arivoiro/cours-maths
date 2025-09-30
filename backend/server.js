require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

// Routes and middleware import
const loginRouter = require("./api/login");
const verifyToken = require("./api/middleware");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Route login
app.use("/api/login", loginRouter);

// Connection to SQLite
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connecté à SQLite');
});

// Create table contacts if they do not exist
db.run(`CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT,
  email TEXT,
  message TEXT
)`);

// Add contact (public)
app.post('/api/contact', (req, res) => {
  const { nom, email, message } = req.body;
  db.run(
    `INSERT INTO contacts (nom, email, message) VALUES (?, ?, ?)`,
    [nom, email, message],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Get all contacts (secured)
app.get('/api/contact', verifyToken, (req, res) => {
  db.all(`SELECT * FROM contacts`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Delete contact by id (secured)
app.delete('/api/contact/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM contacts WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deletedId: id });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Serveur backend en écoute sur http://localhost:${PORT}`);
});
