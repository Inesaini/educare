const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { all, get, run, today } = require("../db");
const config = require("../config");
const {
  authenticate,
  doctor,
  selfOrStaff,
  ownerOrStaff,
  OWNER_SQL,
  bearer,
} = require("../middleware/auth");
const { isSchoolEmail, findUser, findPatientByEmail, getRole } = require("../services/users");
const { createAccount, AccountError } = require("../services/accounts");
const { sendEmail } = require("../services/mailer");
const shared = require("./shared");

const router = express.Router();

const signPurpose = (email, purpose, expiresIn) =>
  jwt.sign({ email, purpose }, config.jwtSecret, { expiresIn });

const sendActivation = (email) => {
  const token = signPurpose(email, "activate", "24h");
  return sendEmail(
    email,
    "EduCare : vérification de votre email",
    `Bonjour,\n\nCliquez sur ce lien pour activer votre compte :\n\n${config.backendUrl}/patients/activate/${token}\n\nCe lien expire dans 24 heures.`
  );
};

// ---------- Account ----------

router.post("/register", async (req, res) => {
  try {
    const created = createAccount("Patient", req.body);
    await sendActivation(req.body.email.toLowerCase());
    res.status(201).json({
      message: "User registered successfully. Please check your email for activation.",
      patientId: created.patientId,
      matricule: created.matricule,
    });
  } catch (err) {
    if (err instanceof AccountError) return res.status(400).json({ error: err.message });
    throw err;
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!isSchoolEmail(email)) {
    return res
      .status(400)
      .json({ error: `Email should be in the right format name@${config.emailDomain}` });
  }
  const user = findUser(email);
  if (!user || !password || !bcrypt.compareSync(String(password), user.password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  if (user.archived_at) return res.status(401).json({ error: "User is archived" });
  const role = getRole(user.id);
  if (role === "medecin" && get("SELECT archive FROM Medecin WHERE utilisateur_id = ?", user.id).archive) {
    return res.status(401).json({ error: "Account disabled" });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, { expiresIn: "7d" });
  res.json({
    message: "Login successful",
    token,
    patient: { id: user.id, email: user.email, verified: Boolean(user.verified), role },
  });
});

router.post("/logout", (req, res) => {
  const token = bearer(req);
  if (!token) return res.status(400).json({ error: "Authorization header missing" });
  const decoded = jwt.decode(token);
  if (!decoded?.exp) return res.status(400).json({ error: "Token invalide" });
  run(
    "INSERT OR IGNORE INTO blacklisted_tokens (token, expires_at) VALUES (?, ?)",
    token,
    new Date(decoded.exp * 1000).toISOString()
  );
  res.json({ message: "Déconnecté avec succès" });
});

router.get("/active", doctor, (req, res) => {
  res.json(
    all(
      `SELECT p.matricule, u.email, p.nom, p.prenom FROM Utilisateur u
       JOIN Patient p ON u.id = p.utilisateur_id
       WHERE u.verified = 1 AND u.archived_at IS NULL`
    )
  );
});

// ---------- Email verification ----------

router.post("/send-email-verification", async (req, res) => {
  const user = findUser(req.body.email);
  if (!user) return res.status(400).json({ error: "Patient not found" });
  if (user.verified) return res.status(400).json({ error: "the account is already activated" });
  await sendActivation(user.email);
  res.status(201).json({ message: "Email sent successfully. Please check your inbox." });
});

const page = (title, text) => `<!doctype html><html lang="fr"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>
<body style="font-family:system-ui,sans-serif;background:#679294;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0">
<main style="text-align:center;padding:24px"><h1>${title}</h1><p>${text}</p>
<p><a style="color:#fff" href="${config.frontendUrl}/">Retour à EduCare</a></p></main></body></html>`;

router.get("/activate/:token", (req, res) => {
  let payload;
  try {
    payload = jwt.verify(req.params.token, config.jwtSecret);
  } catch {
    return res.status(400).send(page("Lien invalide", "Ce lien d'activation est invalide ou a expiré."));
  }
  if (payload.purpose !== "activate") {
    return res.status(400).send(page("Lien invalide", "Ce lien d'activation est invalide ou a expiré."));
  }
  const user = findUser(payload.email);
  if (!user) return res.status(400).send(page("Compte introuvable", "Aucun compte pour cet email."));
  run("UPDATE Utilisateur SET verified = 1 WHERE id = ?", user.id);
  res.send(page("Compte activé", "Votre email est vérifié, vous pouvez vous connecter."));
});

router.get("/verify-status/:email", (req, res) => {
  const user = findUser(req.params.email);
  if (!user) return res.status(404).json({ success: false, message: "Patient not found" });
  res.json({ success: true, verified: Boolean(user.verified) });
});

// ---------- Password ----------

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!isSchoolEmail(email)) {
    return res
      .status(400)
      .json({ error: `Email should be in the right format name@${config.emailDomain}` });
  }
  const user = findUser(email);
  // Same answer whether the account exists or not.
  if (user) {
    const token = signPurpose(user.email, "reset", "1h");
    await sendEmail(
      user.email,
      "EduCare : réinitialisation du mot de passe",
      `Bonjour,\n\nPour choisir un nouveau mot de passe :\n\n${config.frontendUrl}/resetPassword/${token}\n\nCe lien expire dans 1 heure.`
    );
  }
  res.json({ message: "Password reset email sent successfully." });
});

router.post("/set-new-password", (req, res) => {
  const { token, newPassword } = req.body;
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    return res.status(400).json({ error: "Invalid or expired token" });
  }
  if (payload.purpose !== "reset") return res.status(400).json({ error: "Invalid or expired token" });
  if (!newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  const result = run(
    "UPDATE Utilisateur SET password = ? WHERE email = ?",
    bcrypt.hashSync(String(newPassword), 10),
    payload.email
  );
  if (result.changes === 0) return res.status(404).json({ error: "Patient not found" });
  res.json({ message: "Password updated successfully." });
});

// ---------- Profile ----------

const profileOf = (email) =>
  get(
    `SELECT u.id AS utilisateur_id, u.email, p.nom, p.prenom, p.num_tel
     FROM Utilisateur u JOIN Patient p ON u.id = p.utilisateur_id WHERE u.email = ?`,
    email
  );

router.get("/modify-profile/:email", selfOrStaff, (req, res) => {
  const profile = profileOf(req.params.email);
  if (!profile) return res.status(404).json({ message: "User not found" });
  res.json(profile);
});

router.patch("/modify-profile/:email", selfOrStaff, (req, res) => {
  const { nom, prenom, num_tel, new_email } = req.body;
  const user = findUser(req.params.email);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (new_email && new_email.toLowerCase() !== user.email) {
    if (!isSchoolEmail(new_email)) return res.status(400).json({ message: "Invalid email" });
    if (findUser(new_email)) return res.status(400).json({ message: "Email already exists" });
    run("UPDATE Utilisateur SET email = ? WHERE id = ?", new_email.toLowerCase(), user.id);
  }
  const fields = { nom, prenom, num_tel };
  const set = Object.keys(fields).filter((key) => fields[key] !== undefined);
  if (set.length) {
    run(
      `UPDATE Patient SET ${set.map((key) => `${key} = ?`).join(", ")} WHERE utilisateur_id = ?`,
      ...set.map((key) => fields[key]),
      user.id
    );
  }
  res.json({ message: "Profile updated successfully" });
});

router.get("/profile/:email", selfOrStaff, (req, res) => {
  const profile = profileOf(req.params.email);
  if (!profile) return res.status(404).json({ error: "Patient not found" });
  res.json({
    success: true,
    data: {
      id: profile.utilisateur_id,
      email: profile.email,
      firstName: profile.prenom,
      lastName: profile.nom,
      phone: profile.num_tel,
    },
  });
});

// ---------- Photo ----------

fs.mkdirSync(config.uploadsDir, { recursive: true });
const photoUpload = multer({
  storage: multer.diskStorage({
    destination: config.uploadsDir,
    filename: (req, file, cb) =>
      cb(null, `photo-${Date.now()}${path.extname(file.originalname).toLowerCase() || ".jpg"}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Only image files are allowed")),
}).any();

router.post("/upload-id-photo", authenticate, photoUpload, (req, res) => {
  const file = req.files?.[0];
  if (!file) return res.status(400).json({ error: "No file uploaded" });
  const email = (req.body.email || req.user.email).toLowerCase();
  if (email !== req.user.email.toLowerCase() && !["medecin", "admin"].includes(req.user.role)) {
    fs.unlinkSync(file.path);
    return res.status(403).json({ error: "Accès refusé" });
  }
  const url = `${config.backendUrl}/uploads/${file.filename}`;
  const result = run(
    "UPDATE Patient SET photo = ? WHERE utilisateur_id = (SELECT id FROM Utilisateur WHERE email = ?)",
    url,
    email
  );
  if (result.changes === 0) {
    fs.unlinkSync(file.path);
    return res.status(404).json({ error: "No patient found with this email" });
  }
  res.json({ message: "Image uploaded", imageUrl: url });
});

router.get("/get-patient-photo/:email", selfOrStaff, (req, res) => {
  const patient = findPatientByEmail(req.params.email.trim());
  if (!patient) {
    return res.status(404).json({ success: false, image: null, message: "No patient found with this email" });
  }
  if (!patient.photo) {
    return res.json({ success: false, image: null, message: "No photo found for this patient" });
  }
  res.json({ success: true, image: patient.photo });
});

// ---------- Appointments ----------

router.post("/demanderdv/:email", selfOrStaff, (req, res) => {
  const patient = findPatientByEmail(req.params.email);
  if (!patient) return res.status(404).json({ error: "Aucun patient lié à cet utilisateur" });
  const motif = req.body.motif || null;
  const demande = run(
    "INSERT INTO demande (id_patient, motif, date_depot) VALUES (?, ?, ?)",
    patient.id, motif, today()
  );
  const rdv = run(
    "INSERT INTO rendezVous (id_patient, id_demande, motif, email, statut) VALUES (?, ?, ?, ?, 'demandé')",
    patient.id, demande.id, motif, req.params.email.toLowerCase()
  );
  res.status(201).json({ message: "Rendez-vous demandé", id_rdv: rdv.id });
});

router.put("/annulerdv/:id_rdv", ownerOrStaff(OWNER_SQL.rendezVous, "id_rdv"), shared.annulerRendezVous);
router.get("/listerendezvousdupatient/:email", selfOrStaff, shared.rendezVousByEmail);
router.get("/listedemandesdupatient/:email", selfOrStaff, shared.demandesByEmail);

router.get("/next-rendezvous/:email", selfOrStaff, (req, res) => {
  const rdv = get(
    `SELECT r.date, r.heure, r.motif, r.statut FROM rendezVous r
     JOIN Patient p ON r.id_patient = p.id JOIN Utilisateur u ON p.utilisateur_id = u.id
     WHERE u.email = ? AND r.statut = 'programmé' AND r.date || ' ' || r.heure >= strftime('%Y-%m-%d %H:%M', 'now', 'localtime')
     ORDER BY r.date, r.heure LIMIT 1`,
    req.params.email
  );
  if (!rdv) return res.status(404).json({ message: "Aucun rendez-vous à venir." });
  res.json({ ...rdv, dateTime: `${rdv.date}T${rdv.heure}` });
});

// ---------- Medical data (the patient's own) ----------

router.get("/dossier-medical/:email", selfOrStaff, (req, res) => {
  const dossier = get(
    `SELECT dm.* FROM Dossier_Medical dm JOIN Utilisateur u ON dm.utilisateur_id = u.id WHERE u.email = ?`,
    req.params.email
  );
  if (!dossier) return res.status(404).json({ message: "Dossier médical non trouvé" });
  res.json(dossier);
});

router.get("/consultations/:email", selfOrStaff, shared.consultationsByEmail);
router.get("/ordonnance/:id", ownerOrStaff(OWNER_SQL.ordonnance, "id"), shared.ordonnanceById);

router.get(
  "/ordonnance/by-consultation/:consultationId",
  ownerOrStaff(OWNER_SQL.consultation, "consultationId"),
  (req, res) => {
    const ordonnance = get("SELECT * FROM Ordonnance WHERE consultation_id = ?", req.params.consultationId);
    if (!ordonnance) return res.status(404).json({ message: "No ordonnance found for this consultation." });
    const medicaments = all(
      `SELECT m.nom_de_marque AS nom, m.dosage, mio.duree FROM MedicamentsInOrdonnance mio
       JOIN medicaments m ON mio.medicament_id = m.id WHERE mio.ordonnance_id = ?`,
      ordonnance.id_ordonnance
    );
    res.json({
      ordonnance_id: ordonnance.id_ordonnance,
      ordonnance_date: ordonnance.date,
      medicaments,
    });
  }
);

router.get(
  "/examen-medical/by-consultation/:consultation_id",
  ownerOrStaff(OWNER_SQL.consultation, "consultation_id"),
  shared.examenByConsultation
);

module.exports = router;
