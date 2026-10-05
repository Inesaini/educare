const express = require("express");
const { admin } = require("../middleware/auth");
const { createAccount, AccountError } = require("../services/accounts");

const router = express.Router();

router.post("/register", admin, (req, res) => {
  try {
    const created = createAccount("Directeur", req.body);
    res.status(201).json({ message: "User registered successfully.", ...created });
  } catch (err) {
    if (err instanceof AccountError) return res.status(400).json({ error: err.message });
    throw err;
  }
});

module.exports = router;
