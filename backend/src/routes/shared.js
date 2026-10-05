// Handlers used by several route files (patient app and doctor web app).
const { all, get, run } = require("../db");
const { findUser, findPatientByEmail } = require("../services/users");
const { notify } = require("../services/rendezvous");

const consultationsByEmail = (req, res) => {
  const patient = findPatientByEmail(req.params.email);
  if (!patient) return res.status(404).json({ message: "Patient not found." });
  const rows = all(
    "SELECT * FROM Consultation WHERE patient_id = ? ORDER BY date DESC, id_consultation DESC",
    patient.id
  );
  if (rows.length === 0) {
    return res.status(404).json({ message: "No consultations found for this patient." });
  }
  res.json(rows);
};

const ordonnanceById = (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid ordonnance ID" });
  const meds = all(
    `SELECT mio.medicament_id, mio.duree, m.id AS ID, m.nom_de_marque AS NOM_DE_MARQUE,
            m.forme AS FORME, m.dosage AS DOSAGE, m.cond AS COND, o.date AS ordonnance_date
     FROM MedicamentsInOrdonnance mio
     JOIN medicaments m ON m.id = mio.medicament_id
     JOIN Ordonnance o ON o.id_ordonnance = mio.ordonnance_id
     WHERE mio.ordonnance_id = ?`,
    id
  );
  if (meds.length === 0) {
    return res.status(404).json({ message: "No medicaments found for this ordonnance." });
  }
  res.json({ ordonnance_id: id, ordonnance_date: meds[0].ordonnance_date, medicaments: meds });
};

const examenByConsultation = (req, res) => {
  const examen = get("SELECT * FROM Examen_Medical WHERE consultation_id = ?", req.params.consultation_id);
  if (!examen) {
    return res
      .status(404)
      .json({ success: false, message: "⚠️ No examen medical found for this consultation." });
  }
  res.json({ success: true, data: examen });
};

const rendezVousByEmail = (req, res) => {
  res.json(
    all(
      `SELECT r.id_rendezVous, r.date, r.motif, r.heure, r.statut
       FROM rendezVous r
       JOIN Patient p ON r.id_patient = p.id
       JOIN Utilisateur u ON p.utilisateur_id = u.id
       WHERE u.email = ? AND r.statut != 'demandé'
       ORDER BY r.date DESC, r.heure DESC`,
      req.params.email
    )
  );
};

const demandesByEmail = (req, res) => {
  const patient = findPatientByEmail(req.params.email);
  if (!patient) return res.status(404).json({ message: "Patient non trouvé." });
  res.json(
    all(
      `SELECT r.id_rendezVous, d.motif, d.date_depot
       FROM demande d JOIN rendezVous r ON d.id_demande = r.id_demande
       WHERE r.id_patient = ? AND r.statut = 'demandé'
       ORDER BY d.date_depot DESC`,
      patient.id
    )
  );
};

const rdvWithPatient = (id) =>
  get(
    `SELECT r.*, u.email AS patient_email FROM rendezVous r
     JOIN Patient p ON r.id_patient = p.id
     JOIN Utilisateur u ON p.utilisateur_id = u.id
     WHERE r.id_rendezVous = ?`,
    id
  );

// Cancels an appointment. A patient cancelling notifies nobody; a doctor
// cancelling notifies the patient.
const annulerRendezVous = (req, res) => {
  const rdv = rdvWithPatient(req.params.id_rdv);
  if (!rdv) return res.status(404).json({ error: "Rendez-vous introuvable." });
  if (["annulé", "terminé", "refusé"].includes(rdv.statut)) {
    return res.status(400).json({ error: `Ce rendez-vous est déjà ${rdv.statut}.` });
  }
  run("UPDATE rendezVous SET statut = 'annulé' WHERE id_rendezVous = ?", rdv.id_rendezVous);
  if (req.user.role === "medecin") {
    notify(
      rdv.patient_email,
      "Rendez-vous annulé",
      `Votre rendez-vous du ${rdv.date ?? ""} à ${rdv.heure ?? ""} a été annulé par le médecin.`,
      "refused"
    );
  }
  res.json({ message: "Rendez-vous annulé" });
};

const patientsList = (req, res) => {
  res.json(
    all(
      `SELECT p.id, p.matricule, u.email, p.nom, p.prenom, p.categorie
       FROM Patient p JOIN Utilisateur u ON u.id = p.utilisateur_id
       WHERE u.archived_at IS NULL
       ORDER BY p.nom, p.prenom`
    )
  );
};

module.exports = {
  consultationsByEmail,
  ordonnanceById,
  examenByConsultation,
  rendezVousByEmail,
  demandesByEmail,
  annulerRendezVous,
  patientsList,
  rdvWithPatient,
  findUser,
};
