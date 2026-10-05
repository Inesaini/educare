const express = require("express");
const fs = require("node:fs");
const os = require("node:os");
const multer = require("multer");
const { all, get, run } = require("../db");
const { admin, doctor } = require("../middleware/auth");
const { findUser } = require("../services/users");
const { createAccount, AccountError } = require("../services/accounts");
const { readRows } = require("../services/excel");
const shared = require("./shared");

const router = express.Router();

// Users with their role; `archived` selects active or archived accounts.
const usersQuery = (archived) => `
  SELECT u.id,
         COALESCE(m.matricule, p.matricule) AS matricule,
         COALESCE(m.nom, p.nom) AS nom,
         COALESCE(m.prenom, p.prenom) AS prenom,
         u.email,
         CASE
           WHEN m.id IS NOT NULL THEN 'medecin'
           WHEN p.id IS NOT NULL THEN p.categorie
           ELSE 'unknown'
         END AS role
  FROM Utilisateur u
  LEFT JOIN Medecin m ON m.utilisateur_id = u.id
  LEFT JOIN Patient p ON p.utilisateur_id = u.id
  WHERE u.id NOT IN (SELECT utilisateur_id FROM Admin)
    AND u.archived_at IS ${archived ? "NOT NULL" : "NULL"}
  ORDER BY nom, prenom`;

router.get("/get-users", admin, (req, res) => {
  res.json({ utilisateurs: all(usersQuery(false)) });
});

router.get("/get-archived-users", admin, (req, res) => {
  res.json({ utilisateurs: all(usersQuery(true)) });
});

router.get("/search-patient", admin, (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "Search term is required." });
  const like = `%${q}%`;
  res.json({
    results: all(
      `SELECT * FROM (${usersQuery(false)}) WHERE nom LIKE ? OR prenom LIKE ? OR email LIKE ?`,
      like, like, like
    ),
  });
});

router.get("/get-all-medecins", admin, (req, res) => {
  res.json(
    all(
      `SELECT m.archive, u.email, m.nom, m.prenom, m.speciality FROM Medecin m
       JOIN Utilisateur u ON m.utilisateur_id = u.id
       WHERE u.archived_at IS NULL ORDER BY m.nom, m.prenom`
    )
  );
});

router.get("/get-all-patients", doctor, shared.patientsList);
router.get("/get-active-patients", doctor, (req, res) => {
  res.json(
    all(
      `SELECT p.matricule, u.email, p.nom, p.prenom FROM Patient p
       JOIN Utilisateur u ON u.id = p.utilisateur_id WHERE u.verified = 1 AND u.archived_at IS NULL`
    )
  );
});

// Enables / disables a doctor account.
router.put("/edit-medecin-state/:email", admin, (req, res) => {
  const result = run(
    `UPDATE Medecin SET archive = 1 - archive
     WHERE utilisateur_id = (SELECT id FROM Utilisateur WHERE email = ?)`,
    req.params.email
  );
  if (result.changes === 0) return res.status(404).json({ message: "Doctor not found" });
  res.json({ message: "User state edited successfully" });
});

router.delete("/delete-user/:email", admin, (req, res) => {
  const user = findUser(req.params.email);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.id === req.user.id) return res.status(400).json({ message: "You can't delete yourself" });
  run("DELETE FROM Utilisateur WHERE id = ?", user.id);
  res.json({ message: "User deleted successfully" });
});

// Archiving keeps all the medical data; the account just can't log in.
router.post("/archive-user/:email", admin, (req, res) => {
  const user = findUser(req.params.email);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (get("SELECT 1 FROM Admin WHERE utilisateur_id = ?", user.id)) {
    return res.status(400).json({ error: "You can't archive the admin" });
  }
  run("UPDATE Utilisateur SET archived_at = datetime('now') WHERE id = ?", user.id);
  res.json({ message: "✅ User archived successfully." });
});

router.post("/restore-user/:email", admin, (req, res) => {
  const result = run(
    "UPDATE Utilisateur SET archived_at = NULL WHERE email = ? AND archived_at IS NOT NULL",
    req.params.email
  );
  if (result.changes === 0) return res.status(404).json({ error: "❌ Archived user not found" });
  res.json({ message: "✅ User restored successfully." });
});

router.post("/register", admin, (req, res) => {
  try {
    createAccount("Admin", req.body);
    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    if (err instanceof AccountError) return res.status(400).json({ error: err.message });
    throw err;
  }
});

// Excel columns: first name, last name, email, password, birth date, phone,
// matricule, category, sex. Accounts are created already verified.
const excelUpload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.originalname.toLowerCase().endsWith(".xlsx")
      ? cb(null, true)
      : cb(Object.assign(new Error("Seuls les fichiers Excel (.xlsx) sont acceptés"), { status: 400 })),
});

router.post("/bulk-register-pdf", admin, excelUpload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Fichier Excel requis" });
  try {
    const rows = await readRows(req.file.path);
    const results = rows.map(([first_name, last_name, email, password, birth_date, phone, matricule, categorie, sex]) => {
      try {
        const created = createAccount("Patient", {
          first_name, last_name, email, password, birth_date, phone, matricule, categorie, sex, verified: true,
        });
        return { email, status: "success", patientId: created.patientId };
      } catch (err) {
        if (!(err instanceof AccountError)) throw err;
        return { email, status: "failed", error: err.message };
      }
    });
    res.json({ message: "📥 Bulk registration from Excel completed", results });
  } finally {
    fs.rm(req.file.path, { force: true }, () => {});
  }
});

module.exports = router;
