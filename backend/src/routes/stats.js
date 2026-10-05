// Statistics shown on the director and doctor dashboards.
// An academic year "N" runs from September N-1 to May N.
const express = require("express");
const { all, get } = require("../db");
const { staff } = require("../middleware/auth");

const router = express.Router();

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
  "août", "septembre", "octobre", "novembre", "décembre"];
const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const ACADEMIC_MONTHS = [9, 10, 11, 12, 1, 2, 3, 4, 5];
const MALADIE_TYPES = ["contagieuse", "cronique"];

const academicRange = (year) => [`${year - 1}-09-01`, `${year}-05-31`];

const parseYear = (value) => {
  const year = Number.parseInt(value, 10);
  return Number.isNaN(year) ? null : year;
};

// [{mois, total}] -> [{name, value}] for September..May, zeros included.
const byAcademicMonth = (rows) =>
  ACADEMIC_MONTHS.map((mois) => ({
    name: MOIS[mois - 1],
    value: rows.find((r) => r.mois === mois)?.total ?? 0,
  }));

router.get("/patientCount", staff, (req, res) => {
  res.json({ total: get("SELECT COUNT(*) AS total FROM Patient").total });
});

router.get("/countConsultations", staff, (req, res) => {
  res.json({ total: get("SELECT COUNT(*) AS total FROM Consultation").total });
});

router.get("/casContagieuse", staff, (req, res) => {
  res.json({
    total: get(
      `SELECT COUNT(*) AS total FROM Patient_Maladie pm
       JOIN Maladie m ON pm.id_maladie = m.id WHERE m.type = 'contagieuse'`
    ).total,
  });
});

router.get("/getRepartitionPatientsParCategorie", staff, (req, res) => {
  res.json({
    repartition: all("SELECT categorie, COUNT(*) AS nombre FROM Patient GROUP BY categorie"),
  });
});

router.get("/getConsultationsParMois/:annee", staff, (req, res) => {
  const year = parseYear(req.params.annee);
  if (!year) return res.status(400).json({ error: "Année invalide." });
  const rows = all(
    `SELECT CAST(strftime('%m', date) AS INTEGER) AS mois, COUNT(*) AS total
     FROM Consultation WHERE date BETWEEN ? AND ? GROUP BY mois`,
    ...academicRange(year)
  );
  res.json(byAcademicMonth(rows));
});

router.get("/getConsultationsParCategorieAnnuelle/:year", staff, (req, res) => {
  const year = parseYear(req.params.year);
  if (!year) return res.status(400).json({ error: "⚠️ Année invalide" });
  const rows = all(
    `SELECT p.categorie AS name, COUNT(*) AS value FROM Consultation c
     JOIN Patient p ON c.patient_id = p.id
     WHERE c.date BETWEEN ? AND ? GROUP BY p.categorie`,
    ...academicRange(year)
  );
  res.json(
    ["Etudiant", "Enseignant", "ATS"].map((name) => ({
      name,
      value: rows.find((r) => r.name === name)?.value ?? 0,
    }))
  );
});

// One row per month: totals by category and the busiest weekday.
router.get("/consultation_stats/:year", staff, (req, res) => {
  const year = parseYear(req.params.year);
  if (!year) return res.status(400).json({ error: "Année invalide." });
  const range = academicRange(year);
  const months = all(
    `SELECT CAST(strftime('%Y', c.date) AS INTEGER) AS annee,
            CAST(strftime('%m', c.date) AS INTEGER) AS mois_num,
            COUNT(*) AS total,
            SUM(p.categorie = 'Etudiant') AS etudiants,
            SUM(p.categorie = 'Enseignant') AS enseignants,
            SUM(p.categorie = 'ATS') AS ats
     FROM Consultation c JOIN Patient p ON c.patient_id = p.id
     WHERE c.date BETWEEN ? AND ?
     GROUP BY annee, mois_num ORDER BY annee, mois_num`,
    ...range
  );
  const days = all(
    `SELECT CAST(strftime('%Y', date) AS INTEGER) AS annee,
            CAST(strftime('%m', date) AS INTEGER) AS mois_num,
            CAST(strftime('%w', date) AS INTEGER) AS jour, COUNT(*) AS nb
     FROM Consultation WHERE date BETWEEN ? AND ?
     GROUP BY annee, mois_num, jour ORDER BY nb DESC, jour`,
    ...range
  );
  res.json(
    months.map((m) => {
      const peak = days.find((d) => d.annee === m.annee && d.mois_num === m.mois_num);
      return {
        mois: MOIS[m.mois_num - 1],
        mois_num: m.mois_num,
        annee: m.annee,
        total: m.total,
        etudiants: m.etudiants,
        enseignants: m.enseignants,
        ats: m.ats,
        jourDePointe: peak ? JOURS[peak.jour] : null,
      };
    })
  );
});

const parseType = (req, res) => {
  const type = String(req.params.type || "").toLowerCase();
  if (!MALADIE_TYPES.includes(type)) {
    res.status(400).json({ message: "Type de maladie invalide (contagieuse ou cronique)." });
    return null;
  }
  return type;
};

router.get("/getMaladiesParMois/:annee/:type", staff, (req, res) => {
  const type = parseType(req, res);
  if (!type) return;
  const year = parseYear(req.params.annee);
  if (!year) return res.status(400).json({ message: "Année invalide." });
  const rows = all(
    `SELECT CAST(strftime('%m', pm.date_diagnostic) AS INTEGER) AS mois, COUNT(*) AS total
     FROM Patient_Maladie pm JOIN Maladie m ON pm.id_maladie = m.id
     WHERE m.type = ? AND pm.date_diagnostic BETWEEN ? AND ? GROUP BY mois`,
    type,
    ...academicRange(year)
  );
  res.json(byAcademicMonth(rows));
});

router.get("/getStatistiquesMaladiesParTypeEtAnnee/:type/:annee", staff, (req, res) => {
  const type = parseType(req, res);
  if (!type) return;
  const year = parseYear(req.params.annee);
  if (!year) return res.status(400).json({ message: "❌ Année invalide" });
  res.json(
    all(
      `SELECT m.nom AS name, COUNT(DISTINCT pm.id_patient) AS value
       FROM Maladie m JOIN Patient_Maladie pm ON m.id = pm.id_maladie
       WHERE m.type = ? AND pm.date_diagnostic BETWEEN ? AND ?
       GROUP BY m.nom ORDER BY value DESC`,
      type,
      ...academicRange(year)
    )
  );
});

// Per disease: number of cases, split by sex, and the peak month.
router.get("/getStatsMaladies/:type/:annee", staff, (req, res) => {
  const type = parseType(req, res);
  if (!type) return;
  const year = parseYear(req.params.annee);
  if (!year) return res.status(400).json({ message: "Année invalide" });
  const rows = all(
    `SELECT m.id AS maladie_id, m.nom AS maladie, p.sex,
            CAST(strftime('%m', pm.date_diagnostic) AS INTEGER) AS mois, COUNT(*) AS nb
     FROM Patient_Maladie pm
     JOIN Maladie m ON pm.id_maladie = m.id
     JOIN Patient p ON pm.id_patient = p.id
     WHERE m.type = ? AND pm.date_diagnostic BETWEEN ? AND ?
     GROUP BY m.id, p.sex, mois`,
    type,
    ...academicRange(year)
  );
  const stats = new Map();
  for (const row of rows) {
    const s = stats.get(row.maladie_id) ?? {
      maladie_id: row.maladie_id,
      maladie: row.maladie,
      nombre_de_cas: 0,
      repartition_sexe: {},
      months: {},
    };
    s.nombre_de_cas += row.nb;
    if (row.sex) s.repartition_sexe[row.sex] = (s.repartition_sexe[row.sex] ?? 0) + row.nb;
    s.months[row.mois] = (s.months[row.mois] ?? 0) + row.nb;
    stats.set(row.maladie_id, s);
  }
  res.json(
    [...stats.values()]
      .map(({ months, ...s }) => {
        const [peak] = Object.entries(months).sort((a, b) => b[1] - a[1]);
        return { ...s, pic_mensuel: peak ? MOIS[Number(peak[0]) - 1] : null };
      })
      .sort((a, b) => b.nombre_de_cas - a.nombre_de_cas)
  );
});

router.get("/getMedicamentsPlusPrescrits", staff, (req, res) => {
  res.json(
    all(
      `SELECT m.nom_de_marque AS name, COUNT(*) AS value
       FROM MedicamentsInOrdonnance mio JOIN medicaments m ON mio.medicament_id = m.id
       GROUP BY m.nom_de_marque ORDER BY value DESC LIMIT 10`
    )
  );
});

module.exports = router;
