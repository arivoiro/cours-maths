const jwt = require("jsonwebtoken");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const SECRET_KEY = process.env.SECRET_KEY;

function logAction(action) {
  const logPath = path.join("/tmp", "logs.txt"); // même dossier que server.js
  fs.appendFileSync(logPath, `${new Date().toISOString()} - ${action}\n`);
}

function verifyToken(req, res, next) {
  if (!SECRET_KEY) {
    logAction("Erreur configuration serveur: SECRET_KEY manquant");
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

module.exports = verifyToken;
