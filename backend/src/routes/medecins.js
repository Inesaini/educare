const express = require("express");
const fs = require("node:fs");
const os = require("node:os");
const multer = require("multer");
const { all, get, run, transaction, today } = require("../db");
const { doctor, admin } = require("../middleware/auth");
const { findUser, findPatientByEmail } = require("../services/users");
const { createAccount, AccountError } = require("../services/accounts");
const { notify, moveToWorkingSlot, localDate, localTime, normalizeTime } = require("../services/rendezvous");
const { readRows } = require("../services/excel");
const shared = require("./shared");

const router = express.Router();

router.post("/register", admin, (req, res) => {
  try {
    const created = createAccount("Medecin", req.body);
    res.status(201).json({ message: "User registered successfully.", ...created });
  } catch (err) {
    if (err instanceof AccountError) return res.status(400).json({ error: err.message });
    throw err;
  }
});

// ---------- Patients ----------

const patientInfo = (email) => {
  const user = findUser(email);
  if (!user) return null;
  const patient = get("SELECT * FROM Patient WHERE utilisateur_id = ?", user.id);
  return patient ? { user, patient } : null;
};

router.get("/get-user-info/:email", doctor, (req, res) => {
  const info = patientInfo(req.params.email);
  if (!info) return res.status(404).json({ message: "Patient non trouvé" });
  const { user, patient } = info;
  res.json({
    nom: patient.nom,
    prenom: patient.prenom,
    num_tel: patient.num_tel,
    date_naissance: patient.date_naissance,
    statut: patient.categorie,
    email: user.email,
    isActif: !user.archived_at,
  });
});

router.get("/get-utilisateur/:email", doctor, (req, res) => {
  const info = patientInfo(req.params.email);
  if (!info) return res.status(404).json({ error: "Utilisateur not found" });
  const { user, patient } = info;
  res.json({
    utilisateur: {
      id: user.id,
      email: user.email,
      isActif: !user.archived_at,
      nom: patient.nom,
      prenom: patient.prenom,
      photo: patient.photo,
      date_naissance: patient.date_naissance,
    },
  });
});

router.get(["/get-patient", "/get-patients"], doctor, shared.patientsList);

router.get("/search-patient", doctor, (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "Search term is required." });
  const like = `%${q}%`;
  res.json({
    results: all(
      `SELECT u.email, p.nom, p.prenom FROM Patient p JOIN Utilisateur u ON p.utilisateur_id = u.id
       WHERE u.archived_at IS NULL AND (p.nom LIKE ? OR p.prenom LIKE ? OR u.email LIKE ? OR p.matricule LIKE ?)
       ORDER BY p.nom, p.prenom`,
      like, like, like, like
    ),
  });
});

router.get("/search-medicament", doctor, (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "Search term is required." });
  res.json({
    results: all(
      "SELECT * FROM medicaments WHERE nom_de_marque LIKE ? ORDER BY nom_de_marque LIMIT 50",
      `%${q}%`
    ),
  });
});

router.get("/searchMaladies", doctor, (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "Le terme de recherche est requis." });
  res.json({ results: all("SELECT * FROM Maladie WHERE nom LIKE ? ORDER BY nom", `%${q}%`) });
});

router.get("/has-hasMaladieForPatient/:id_patient", doctor, (req, res) => {
  const exists = Boolean(get("SELECT 1 FROM Patient_Maladie WHERE id_patient = ?", req.params.id_patient));
  res.json({ success: true, exists });
});

router.get("/get-medicaments/:id_patient", doctor, (req, res) => {
  const maladies = all(
    `SELECT m.id, m.nom, m.type, pm.date_diagnostic FROM Patient_Maladie pm
     JOIN Maladie m ON pm.id_maladie = m.id WHERE pm.id_patient = ? ORDER BY pm.date_diagnostic DESC`,
    req.params.id_patient
  );
  if (maladies.length === 0) {
    return res.status(404).json({ success: false, message: "⚠️ No maladies found for this patient." });
  }
  res.json({ success: true, data: maladies });
});

router.post("/ajouterMaladieAuPatient", doctor, (req, res) => {
  const { email, id_maladie, date_diagnostic } = req.body;
  const patient = email && findPatientByEmail(email);
  if (!patient) return res.status(404).json({ error: "❌ Aucun patient trouvé avec cet e-mail." });
  if (!get("SELECT 1 FROM Maladie WHERE id = ?", id_maladie)) {
    return res.status(404).json({ error: "Maladie introuvable." });
  }
  run(
    "INSERT INTO Patient_Maladie (id_patient, id_maladie, date_diagnostic) VALUES (?, ?, ?)",
    patient.id, id_maladie, date_diagnostic || today()
  );
  res.json({ message: "✅ Maladie liée au patient avec succès." });
});

// ---------- Dossier médical ----------

const BOOL_FIELDS = ["tabac_fume", "tabac_chique", "tabac_pris", "ancien_fume", "alcool"];
const NUMBER_FIELDS = ["taille", "poids", "tabac_fume_nombre", "tabac_chique_nombre",
  "tabac_pris_nombre", "age_pris", "periode_exposition"];
const TEXT_FIELDS = ["groupeSanguin", "numSecuriteSociale", "adresse", "situation_famille",
  "medicaments", "affectionsCongenitales", "maladiesGenerales", "interventionsChirurgicales",
  "reactionsAllergiques", "notes", "nom", "prenom", "num_tel", "date_naissance"];

const toBool = (value) => {
  if (typeof value === "string") {
    const v = value.toLowerCase();
    if (v === "oui" || v === "true") return true;
    if (v === "non" || v === "false" || v === "") return false;
  }
  return Boolean(value);
};
const toNumber = (value) => {
  const n = Number.parseFloat(value);
  return Number.isNaN(n) ? null : n;
};

// Only known columns, converted to their type.
const dossierFields = (input) => {
  const fields = {};
  for (const key of BOOL_FIELDS) if (key in input) fields[key] = toBool(input[key]);
  for (const key of NUMBER_FIELDS) if (key in input) fields[key] = toNumber(input[key]);
  for (const key of TEXT_FIELDS) if (key in input) fields[key] = input[key] === "" ? null : input[key];
  return fields;
};

const dossierOf = (utilisateurId) =>
  get("SELECT * FROM Dossier_Medical WHERE utilisateur_id = ?", utilisateurId);

router.get("/get-dossier-medical/:email", doctor, (req, res) => {
  const user = findUser(req.params.email);
  if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
  const dossier = dossierOf(user.id);
  if (!dossier) return res.status(404).json({ message: "Dossier médical non trouvé" });
  res.json(dossier);
});

router.post("/dossier-medical-create/:email", doctor, (req, res) => {
  const info = patientInfo(req.params.email);
  if (!info) return res.status(404).json({ message: "Patient non trouvé pour cet utilisateur" });
  if (dossierOf(info.user.id)) {
    return res.status(400).json({ message: "Un dossier médical existe déjà pour cet utilisateur" });
  }
  const fields = {
    ...dossierFields(req.body),
    utilisateur_id: info.user.id,
    date_creation: today(),
    statut: info.patient.categorie,
  };
  const keys = Object.keys(fields);
  run(
    `INSERT INTO Dossier_Medical (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`,
    ...keys.map((k) => fields[k])
  );
  res.status(201).json({ message: "Dossier médical créé avec succès", dossier: dossierOf(info.user.id) });
});

router.put("/medical-records-update/:email", doctor, (req, res) => {
  const user = findUser(req.params.email);
  if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
  if (!dossierOf(user.id)) return res.status(404).json({ message: "Dossier médical non trouvé" });
  const fields = dossierFields(req.body);
  const keys = Object.keys(fields);
  if (keys.length) {
    run(
      `UPDATE Dossier_Medical SET ${keys.map((k) => `${k} = ?`).join(", ")} WHERE utilisateur_id = ?`,
      ...keys.map((k) => fields[k]),
      user.id
    );
  }
  res.json({ message: "Dossier médical mis à jour avec succès", dossier: dossierOf(user.id) });
});

// ---------- Consultations ----------

const CONSULTATION_FIELDS = ["type", "symptomes", "observations", "diagnostic", "piece", "motif", "id_rendezVous"];

router.post("/consultation-create/:email", doctor, (req, res) => {
  const patient = findPatientByEmail(req.params.email);
  if (!patient) return res.status(404).json({ message: "Patient not found with this email" });
  const c = req.body;
  const created = run(
    `INSERT INTO Consultation (patient_id, date, type, symptomes, observations, diagnostic, piece, motif, id_rendezVous)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    patient.id, today(), c.type, c.symptomes, c.observations, c.diagnostic, c.piece, c.motif, c.id_rendezVous
  );
  res.status(201).json({
    success: true,
    message: "✅ Consultation created successfully",
    id_consultation: created.id,
  });
});

router.patch("/modify-consultation/:id_consultation", doctor, (req, res) => {
  const keys = CONSULTATION_FIELDS.filter((k) => k in req.body);
  const result = run(
    `UPDATE Consultation SET ${[...keys.map((k) => `${k} = ?`), "date = ?"].join(", ")}
     WHERE id_consultation = ?`,
    ...keys.map((k) => req.body[k]),
    today(),
    req.params.id_consultation
  );
  if (result.changes === 0) {
    return res.status(404).json({ success: false, message: "⚠️ Consultation not found to update." });
  }
  res.json({ success: true, message: "✅ Consultation updated successfully" });
});

router.get("/consultations-patient/:email", doctor, shared.consultationsByEmail);

router.get("/get-consultation/:id", doctor, (req, res) => {
  const rows = all("SELECT * FROM Consultation WHERE id_consultation = ?", req.params.id);
  if (rows.length === 0) return res.status(404).json({ message: "No consultations found for this patient." });
  res.json(rows);
});

router.delete("/delete-consultation/:id", doctor, (req, res) => {
  const result = run("DELETE FROM Consultation WHERE id_consultation = ?", req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Consultation not found" });
  res.json({ success: "Consultation deleted successfully" });
});

// ---------- Examen médical ----------

const EXAMEN_FIELDS = all("PRAGMA table_info(Examen_Medical)")
  .map((c) => c.name)
  .filter((name) => !["id", "consultation_id"].includes(name));

router.post("/examen-medical-create/:id", doctor, (req, res) => {
  if (!get("SELECT 1 FROM Consultation WHERE id_consultation = ?", req.params.id)) {
    return res.status(404).json({ success: false, message: "⚠️ Consultation not found." });
  }
  if (get("SELECT 1 FROM Examen_Medical WHERE consultation_id = ?", req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "⚠️ Examen médical already exists for this consultation." });
  }
  const keys = EXAMEN_FIELDS.filter((k) => k in req.body);
  const created = run(
    `INSERT INTO Examen_Medical (consultation_id${keys.map((k) => `, ${k}`).join("")})
     VALUES (?${keys.map(() => ", ?").join("")})`,
    req.params.id,
    ...keys.map((k) => req.body[k])
  );
  res.status(201).json({ success: true, message: "✅ Examen médical created successfully", id: created.id });
});

router.get("/consultations/:consultation_id/examen-medical", doctor, shared.examenByConsultation);

router.get("/consultations/:consultation_id/has-examen-medical", doctor, (req, res) => {
  const exists = Boolean(get("SELECT 1 FROM Examen_Medical WHERE consultation_id = ?", req.params.consultation_id));
  res.json({ success: true, exists });
});

// ---------- Ordonnances ----------

router.get("/consultations/:consultation_id/has-ordonnance", doctor, (req, res) => {
  const ordonnance = get("SELECT id_ordonnance FROM Ordonnance WHERE consultation_id = ?", req.params.consultation_id);
  res.json({ success: true, exists: Boolean(ordonnance), id_ordonnance: ordonnance?.id_ordonnance ?? null });
});

router.get("/consultations/:consultation_id/medicaments", doctor, (req, res) => {
  const medicaments = all(
    `SELECT mio.medicament_id, mio.duree, m.nom_de_marque, m.forme, m.dosage, m.cond
     FROM MedicamentsInOrdonnance mio
     JOIN Ordonnance o ON o.id_ordonnance = mio.ordonnance_id
     JOIN medicaments m ON m.id = mio.medicament_id
     WHERE o.consultation_id = ?`,
    req.params.consultation_id
  );
  if (medicaments.length === 0) {
    return res.status(404).json({ success: false, message: "⚠️ No medicaments found for this consultation.", medicaments });
  }
  res.json({ success: true, message: "✅ Medicaments fetched successfully.", medicaments });
});

router.post("/create-ordonnance/:consultation_id", doctor, (req, res) => {
  const { consultation_id } = req.params;
  if (!get("SELECT 1 FROM Consultation WHERE id_consultation = ?", consultation_id)) {
    return res.status(404).json({ success: false, message: "⚠️ Consultation not found." });
  }
  const existing = get("SELECT id_ordonnance FROM Ordonnance WHERE consultation_id = ?", consultation_id);
  if (existing) {
    return res.json({
      success: false,
      message: "⚠️ Ordonnance already exists for this consultation.",
      id_ordonnance: existing.id_ordonnance,
    });
  }
  const created = run("INSERT INTO Ordonnance (date, consultation_id) VALUES (?, ?)", today(), consultation_id);
  res.status(201).json({ success: true, message: "✅ Ordonnance created successfully", id_ordonnance: created.id });
});

router.post("/add-medicament/:id_ordonnance/:id_medicament", doctor, (req, res) => {
  const { id_ordonnance, id_medicament } = req.params;
  const { duree } = req.body;
  if (!duree) return res.status(400).json({ error: "All fields are required." });
  if (!get("SELECT 1 FROM Ordonnance WHERE id_ordonnance = ?", id_ordonnance)) {
    return res.status(404).json({ success: false, message: "⚠️ Ordonnance not found." });
  }
  if (!get("SELECT 1 FROM medicaments WHERE id = ?", id_medicament)) {
    return res.status(404).json({ success: false, message: "⚠️ Medicament not found." });
  }
  const result = run(
    "INSERT OR IGNORE INTO MedicamentsInOrdonnance (ordonnance_id, medicament_id, duree) VALUES (?, ?, ?)",
    id_ordonnance, id_medicament, duree
  );
  if (result.changes === 0) {
    return res.json({ success: false, message: "⚠️ Medicament already added to ordonnance." });
  }
  res.status(201).json({ success: true, message: "✅ Medicament added to ordonnance." });
});

router.get("/get-ordonnance/:id", doctor, shared.ordonnanceById);

router.delete("/delete-ordonnance/:id", doctor, (req, res) => {
  const result = run("DELETE FROM Ordonnance WHERE id_ordonnance = ?", req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Ordonnance not found" });
  res.json({ success: "Ordonnance deleted successfully" });
});

// ---------- Rendez-vous ----------

const slotTaken = (date, heure, exceptId = 0) =>
  Boolean(
    get(
      `SELECT 1 FROM rendezVous WHERE date = ? AND heure = ? AND id_rendezVous != ?
       AND statut = 'programmé'`,
      date, heure, exceptId
    )
  );

const scheduleNew = (req, res, email, { date_rdv, heure_rdv, motif }) => {
  if (!date_rdv || !heure_rdv) {
    return res.status(400).json({ error: "Les champs date et heure sont requis." });
  }
  const patient = findPatientByEmail(email);
  if (!patient) return res.status(404).json({ error: "Patient non trouvé pour cet utilisateur." });
  const heure = normalizeTime(heure_rdv);
  if (slotTaken(date_rdv, heure)) {
    return res.status(400).json({ error: "Un rendez-vous est déjà programmé à cette date et heure." });
  }
  const created = run(
    "INSERT INTO rendezVous (id_patient, date, heure, motif, statut, email) VALUES (?, ?, ?, ?, 'programmé', ?)",
    patient.id, date_rdv, heure, motif, email.toLowerCase()
  );
  notify(email, "Nouveau rendez-vous", `Votre rendez-vous du ${date_rdv} à ${heure} a été programmé.`, "scheduled");
  res.status(201).json({ message: "Rendez-vous programmé avec succès par le médecin.", id_rdv: created.id });
};

router.post("/programmerdvpatient/:email", doctor, (req, res) => scheduleNew(req, res, req.params.email, req.body));
router.post("/programmerrdvdirect", doctor, (req, res) => scheduleNew(req, res, req.body.email || "", req.body));

// Schedules a request made by a patient.
router.put("/programmerdv/:id_rdv", doctor, (req, res) => {
  const { date_rdv, heure_rdv } = req.body;
  const rdv = shared.rdvWithPatient(req.params.id_rdv);
  if (!rdv) return res.status(404).json({ error: "Rendez-vous introuvable." });
  if (rdv.statut !== "demandé") {
    return res.status(400).json({ error: "Ce rendez-vous n'est pas en statut demandé." });
  }
  if (!date_rdv || !heure_rdv) return res.status(400).json({ error: "Date et heure requises." });
  const heure = normalizeTime(heure_rdv);
  if (slotTaken(date_rdv, heure, rdv.id_rendezVous)) {
    return res.status(400).json({ error: "Un autre rendez-vous est déjà programmé à cette date et heure." });
  }
  run(
    "UPDATE rendezVous SET date = ?, heure = ?, statut = 'programmé' WHERE id_rendezVous = ?",
    date_rdv, heure, rdv.id_rendezVous
  );
  notify(rdv.patient_email, "Rendez-vous accepté", `Votre rendez-vous est fixé le ${date_rdv} à ${heure}.`, "accepted");
  res.json({ message: "Rendez-vous programmé avec succès." });
});

router.patch("/modifierrdv/:id_rendezVous", doctor, (req, res) => {
  const rdv = shared.rdvWithPatient(req.params.id_rendezVous);
  if (!rdv) return res.status(404).json({ error: "Rendez-vous introuvable." });
  if (["annulé", "terminé"].includes(rdv.statut)) {
    return res.status(400).json({ error: `Impossible de modifier un rendez-vous ${rdv.statut}.` });
  }
  const fields = {};
  if (req.body.date_rdv !== undefined) fields.date = req.body.date_rdv;
  if (req.body.heure_rdv !== undefined) fields.heure = normalizeTime(req.body.heure_rdv);
  if (req.body.motif !== undefined) fields.motif = req.body.motif;
  if (req.body.statut !== undefined) {
    const statut = String(req.body.statut).toLowerCase();
    if (!["programmé", "annulé", "terminé"].includes(statut)) {
      return res.status(400).json({ error: "Statut invalide." });
    }
    fields.statut = statut;
  }
  const keys = Object.keys(fields);
  if (keys.length === 0) return res.status(400).json({ error: "Aucun champ valide à modifier." });
  if (slotTaken(fields.date ?? rdv.date, fields.heure ?? rdv.heure, rdv.id_rendezVous)) {
    return res.status(400).json({ error: "Un autre rendez-vous est déjà programmé à cette date et heure." });
  }
  run(
    `UPDATE rendezVous SET ${keys.map((k) => `${k} = ?`).join(", ")} WHERE id_rendezVous = ?`,
    ...keys.map((k) => fields[k]),
    rdv.id_rendezVous
  );
  res.json({ message: "Rendez-vous modifié avec succès.", champs_modifiés: keys });
});

router.put("/annulerdv/:id_rdv", doctor, shared.annulerRendezVous);
router.delete("/rendezvous/:id_rdv", doctor, shared.annulerRendezVous);

router.put("/refuserdv/:id_rdv", doctor, (req, res) => {
  const rdv = shared.rdvWithPatient(req.params.id_rdv);
  if (!rdv) return res.status(404).json({ error: "Rendez-vous introuvable" });
  if (rdv.statut !== "demandé") {
    return res.status(400).json({ error: "Seuls les rendez-vous en statut 'demandé' peuvent être refusés" });
  }
  run("UPDATE rendezVous SET statut = 'refusé' WHERE id_rendezVous = ?", rdv.id_rendezVous);
  notify(rdv.patient_email, "Demande refusée", "Votre demande de rendez-vous a été refusée par le médecin.", "refused");
  res.json({ message: "Rendez-vous refusé" });
});

router.get("/listedesrendezvous", doctor, (req, res) => {
  res.json(
    all(
      `SELECT p.nom, p.prenom, u.email, r.date, r.heure, r.statut, r.motif, r.id_rendezVous
       FROM rendezVous r JOIN Patient p ON r.id_patient = p.id JOIN Utilisateur u ON p.utilisateur_id = u.id
       WHERE r.statut IN ('programmé', 'annulé', 'terminé')
       ORDER BY r.date DESC, r.heure DESC`
    )
  );
});

router.get("/listedesdemandes", doctor, (req, res) => {
  res.json(
    all(
      `SELECT r.motif, d.date_depot, p.nom, p.prenom, r.id_rendezVous, u.email
       FROM rendezVous r JOIN demande d ON r.id_demande = d.id_demande
       JOIN Patient p ON r.id_patient = p.id JOIN Utilisateur u ON p.utilisateur_id = u.id
       WHERE r.statut = 'demandé' ORDER BY d.date_depot`
    )
  );
});

router.get("/listerendezvousdupatient/:email", doctor, shared.rendezVousByEmail);
router.get("/listedemandesdupatient/:email", doctor, shared.demandesByEmail);

// Excel file: one patient per row, email in the 3rd column. Appointments are
// placed every `interval` minutes from `startDate`, on working slots.
const excelUpload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.originalname.toLowerCase().endsWith(".xlsx")
      ? cb(null, true)
      : cb(Object.assign(new Error("Seuls les fichiers Excel (.xlsx) sont acceptés"), { status: 400 })),
});

router.post("/bulk-schedule", doctor, excelUpload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Fichier Excel requis" });
  try {
    const { startDate, interval } = req.body;
    const minutes = Number.parseInt(interval, 10);
    if (!startDate || !(minutes > 0)) {
      return res.status(400).json({ error: "startDate et interval sont requis" });
    }
    const rows = await readRows(req.file.path);
    const cursor = new Date(`${startDate}T08:00:00`);
    const results = [];
    transaction(() => {
      for (const row of rows) {
        const email = row[2];
        const patient = email && findPatientByEmail(email);
        if (!patient) {
          results.push({ email: email || null, status: "failed", error: email ? "Patient introuvable" : "Email manquant" });
          continue;
        }
        moveToWorkingSlot(cursor);
        while (slotTaken(localDate(cursor), localTime(cursor))) {
          cursor.setMinutes(cursor.getMinutes() + minutes);
          moveToWorkingSlot(cursor);
        }
        const date = localDate(cursor);
        const heure = localTime(cursor);
        run(
          "INSERT INTO rendezVous (id_patient, date, heure, statut, email, motif) VALUES (?, ?, ?, 'programmé', ?, ?)",
          patient.id, date, heure, email.toLowerCase(), "contrôle médical"
        );
        notify(email, "Nouveau rendez-vous", `Contrôle médical le ${date} à ${heure}.`, "scheduled");
        results.push({ email, status: "success", date, heure, motif: "contrôle médical" });
        cursor.setMinutes(cursor.getMinutes() + minutes);
      }
    });
    res.json({ message: "Programmation des rendez-vous terminée", results });
  } finally {
    fs.rm(req.file.path, { force: true }, () => {});
  }
});

module.exports = router;
