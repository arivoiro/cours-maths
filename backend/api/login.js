const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const SECRET_KEY = process.env.SECRET_KEY;

router.post("/", async (req, res) => {
  const { password } = req.body;
  if (!ADMIN_PASSWORD_HASH || !SECRET_KEY) {
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  const match = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!match) return res.status(401).json({ error: "Mot de passe invalide" });

  const token = jwt.sign({ role: "admin" }, SECRET_KEY, { expiresIn: "2h" });
  res.json({ token });
});

module.exports = router;
