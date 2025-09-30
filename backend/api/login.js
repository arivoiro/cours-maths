const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const fs = require("fs");

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const SECRET_KEY = process.env.SECRET_KEY;

function logAction(action) {
  const line = `${new Date().toISOString()} - ${action}\n`;
  fs.appendFileSync("logs.txt", line);
}

router.post("/", async (req, res) => {
  const { password } = req.body;
  if (!ADMIN_PASSWORD_HASH || !SECRET_KEY) {
    logAction("Erreur configuration serveur : admin hash ou secret manquant");
    return res.status(500).json({ error: "Server misconfiguration" });
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

module.exports = router;
