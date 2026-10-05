// Demo data: staff accounts, ~60 fictional patients and two academic years of
// consultations, appointments and diagnoses. Every account uses DEMO_PASSWORD.
const bcrypt = require("bcryptjs");

const DEMO_PASSWORD = "educare123";

const PRENOMS_H = ["Amine", "Yacine", "Mohamed", "Walid", "Karim", "Sofiane", "Bilal", "Riad",
  "Nassim", "Hichem", "Ilyes", "Anis", "Mehdi", "Zakaria", "Ayoub", "Islam", "Fares", "Rayane"];
const PRENOMS_F = ["Amel", "Sara", "Lina", "Meriem", "Nour", "Imane", "Rania", "Yasmine",
  "Kenza", "Asma", "Ines", "Chaima", "Dounia", "Feriel", "Hiba", "Selma", "Malak", "Aya"];
const NOMS = ["Benali", "Haddad", "Belkacem", "Mansouri", "Bouzid", "Khelifi", "Saadi", "Brahimi",
  "Cherif", "Djebbar", "Ferhat", "Ghanem", "Hamidi", "Kaci", "Lounis", "Meziane", "Nait", "Ouali",
  "Rahmani", "Slimani", "Taleb", "Yahiaoui", "Zerrouki", "Amrani", "Bensaid", "Chikhi"];

const MEDICAMENTS = [
  ["DOLIPRANE", "Comprimé", "500 mg", "Boîte de 16"], ["DOLIPRANE", "Comprimé", "1000 mg", "Boîte de 8"],
  ["EFFERALGAN", "Comprimé effervescent", "500 mg", "Boîte de 16"], ["PARALGAN", "Comprimé", "500 mg", "Boîte de 20"],
  ["SPASFON", "Comprimé", "80 mg", "Boîte de 30"], ["ADVIL", "Comprimé", "400 mg", "Boîte de 14"],
  ["BRUFEN", "Comprimé", "400 mg", "Boîte de 30"], ["ASPEGIC", "Sachet", "1000 mg", "Boîte de 20"],
  ["AUGMENTIN", "Comprimé", "1 g", "Boîte de 12"], ["AMOXIL", "Gélule", "500 mg", "Boîte de 12"],
  ["CLAMOXYL", "Gélule", "500 mg", "Boîte de 12"], ["ZITHROMAX", "Comprimé", "250 mg", "Boîte de 6"],
  ["CIFLOX", "Comprimé", "500 mg", "Boîte de 10"], ["FLAGYL", "Comprimé", "500 mg", "Boîte de 20"],
  ["SMECTA", "Sachet", "3 g", "Boîte de 30"], ["IMODIUM", "Gélule", "2 mg", "Boîte de 20"],
  ["GAVISCON", "Suspension buvable", "250 ml", "Flacon"], ["MOPRAL", "Gélule", "20 mg", "Boîte de 14"],
  ["INEXIUM", "Comprimé", "40 mg", "Boîte de 14"], ["MOTILIUM", "Comprimé", "10 mg", "Boîte de 40"],
  ["VOGALENE", "Lyophilisat", "7,5 mg", "Boîte de 16"], ["CLARITINE", "Comprimé", "10 mg", "Boîte de 15"],
  ["AERIUS", "Comprimé", "5 mg", "Boîte de 15"], ["ZYRTEC", "Comprimé", "10 mg", "Boîte de 15"],
  ["VENTOLINE", "Suspension pour inhalation", "100 µg/dose", "Flacon de 200 doses"],
  ["SERETIDE", "Poudre pour inhalation", "250/50 µg", "Inhalateur de 60 doses"],
  ["HELICIDINE", "Sirop", "10 %", "Flacon de 250 ml"], ["TOPLEXIL", "Sirop", "0,33 mg/ml", "Flacon de 150 ml"],
  ["RHINOFLUIMUCIL", "Solution nasale", "10 ml", "Flacon pulvérisateur"],
  ["GLUCOPHAGE", "Comprimé", "850 mg", "Boîte de 30"], ["LANTUS", "Solution injectable", "100 UI/ml", "Stylo de 3 ml"],
  ["AMLOR", "Gélule", "5 mg", "Boîte de 30"], ["TENORMINE", "Comprimé", "50 mg", "Boîte de 28"],
  ["LEVOTHYROX", "Comprimé", "75 µg", "Boîte de 30"], ["DEPAKINE", "Comprimé", "500 mg", "Boîte de 40"],
  ["VITAMINE C UPSA", "Comprimé effervescent", "1000 mg", "Tube de 20"],
  ["TARDYFERON", "Comprimé", "80 mg", "Boîte de 30"], ["MAGNE B6", "Comprimé", "48 mg", "Boîte de 60"],
  ["BETADINE", "Solution dermique", "10 %", "Flacon de 125 ml"], ["BIAFINE", "Émulsion", "93 g", "Tube"],
  ["VOLTARENE", "Gel", "1 %", "Tube de 50 g"], ["FUCIDINE", "Crème", "2 %", "Tube de 15 g"],
  ["TOBREX", "Collyre", "0,3 %", "Flacon de 5 ml"], ["DACRYOSERUM", "Solution ophtalmique", "5 ml", "Boîte de 20 unidoses"],
];

const MALADIES = [
  ["Grippe saisonnière", "contagieuse"], ["COVID-19", "contagieuse"], ["Varicelle", "contagieuse"],
  ["Angine streptococcique", "contagieuse"], ["Gastro-entérite", "contagieuse"],
  ["Conjonctivite infectieuse", "contagieuse"], ["Tuberculose", "contagieuse"], ["Rougeole", "contagieuse"],
  ["Hépatite A", "contagieuse"],
  ["Asthme", "cronique"], ["Diabète de type 1", "cronique"], ["Diabète de type 2", "cronique"],
  ["Hypertension artérielle", "cronique"], ["Épilepsie", "cronique"], ["Hypothyroïdie", "cronique"],
  ["Maladie cœliaque", "cronique"], ["Migraine chronique", "cronique"],
];

const MOTIFS = ["Fièvre et maux de gorge", "Toux persistante", "Douleurs abdominales", "Maux de tête",
  "Contrôle médical annuel", "Certificat d'aptitude sportive", "Allergie saisonnière", "Douleur au genou",
  "Fatigue générale", "Renouvellement d'ordonnance", "Vertiges", "Éruption cutanée", "Suivi de tension",
  "Suivi diabète", "Crise d'asthme", "Troubles du sommeil", "Visite médicale d'embauche"];

const DIAGNOSTICS = ["Rhinopharyngite", "Angine virale", "Gastro-entérite aiguë", "Céphalées de tension",
  "Bon état général", "Apte à la pratique sportive", "Rhinite allergique", "Entorse bénigne",
  "Anémie légère", "Stable sous traitement", "Lombalgie commune", "Eczéma de contact"];

// Small deterministic PRNG so every seed gives the same data.
const rng = (() => {
  let s = 20262027;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
})();
const pick = (list) => list[Math.floor(rng() * list.length)];
const chance = (p) => rng() < p;
const int = (min, max) => min + Math.floor(rng() * (max - min + 1));

const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
// Algerian working week: Sunday to Thursday.
const isWorkingDay = (d) => d.getDay() !== 5 && d.getDay() !== 6;
const randomWorkingDay = (from, to) => {
  const span = Math.max(1, Math.round((to - from) / 86400000));
  for (;;) {
    const d = addDays(from, int(0, span));
    if (isWorkingDay(d)) return d;
  }
};
const randomSlot = () => `${pad(pick([8, 9, 10, 11, 14, 15]))}:${pick(["00", "30"])}`;

const seed = ({ all, get, run, transaction }) => {
  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const academicStart = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const historyStart = new Date(academicStart - 1, 8, 1); // previous academic year

  transaction(() => {
    const user = (email, verified = 1) =>
      run("INSERT INTO Utilisateur (email, password, verified) VALUES (?, ?, ?)", email, hash, verified).id;

    run("INSERT INTO Admin (utilisateur_id) VALUES (?)", user("admin@esi-sba.dz"));

    const doctors = [
      ["medecin@esi-sba.dz", "Bensalem", "Nadia", "Médecine générale"],
      ["k.ferhat@esi-sba.dz", "Ferhat", "Karim", "Médecine générale"],
    ];
    doctors.forEach(([email, nom, prenom, speciality], i) => {
      run(
        `INSERT INTO Medecin (utilisateur_id, matricule, nom, prenom, num_tel, date_naissance, speciality)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        user(email), `MED-00${i + 1}`, nom, prenom, `0550${int(100000, 999999)}`, `198${i + 2}-0${i + 3}-14`, speciality
      );
    });

    const addPatient = (email, nom, prenom, categorie, sex, birthYear, verified = 1) => {
      const id = run(
        `INSERT INTO Patient (utilisateur_id, categorie, matricule, nom, prenom, sex, num_tel, date_naissance)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        user(email, verified), categorie, `${categorie.slice(0, 3).toUpperCase()}-${int(10000, 99999)}`,
        nom, prenom, sex, `0${pick(["5", "6", "7"])}${int(10000000, 99999999)}`,
        `${birthYear}-${pad(int(1, 12))}-${pad(int(1, 28))}`
      ).id;
      return { id, email, categorie, sex };
    };

    const directeur = addPatient("directeur@esi-sba.dz", "Kaddour", "Samir", "Directeur", "Male", 1972);
    run("INSERT INTO Directeur (patient_id) VALUES (?)", directeur.id);

    const patients = [];
    const used = new Set();
    for (let i = 0; i < 60; i++) {
      const sex = chance(0.5) ? "Male" : "Female";
      let prenom, nom, email;
      do {
        prenom = pick(sex === "Male" ? PRENOMS_H : PRENOMS_F);
        nom = pick(NOMS);
        email = `${prenom[0]}.${nom}`.toLowerCase() + "@esi-sba.dz";
      } while (used.has(email));
      used.add(email);
      const categorie = i < 44 ? "Etudiant" : i < 53 ? "Enseignant" : "ATS";
      const birthYear = categorie === "Etudiant" ? int(2000, 2007) : int(1965, 1992);
      patients.push(addPatient(email, nom, prenom, categorie, sex, birthYear, i === 59 ? 0 : 1));
    }

    MEDICAMENTS.forEach((m) =>
      run("INSERT INTO medicaments (nom_de_marque, forme, dosage, cond) VALUES (?, ?, ?, ?)", ...m)
    );
    const medicamentIds = all("SELECT id FROM medicaments").map((r) => r.id);
    MALADIES.forEach((m) => run("INSERT INTO Maladie (nom, type) VALUES (?, ?)", ...m));
    const maladies = all("SELECT id, type FROM Maladie");

    // Medical records for most patients.
    for (const p of patients.filter(() => chance(0.8))) {
      const taille = p.sex === "Male" ? int(165, 190) : int(155, 175);
      const fume = p.categorie !== "Etudiant" && chance(0.25);
      run(
        `INSERT INTO Dossier_Medical (utilisateur_id, date_creation, groupeSanguin, adresse, situation_famille,
           taille, poids, tabac_fume, tabac_fume_nombre, alcool, maladiesGenerales, reactionsAllergiques, statut,
           nom, prenom, num_tel, date_naissance)
         SELECT p.utilisateur_id, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, p.categorie, p.nom, p.prenom, p.num_tel, p.date_naissance
         FROM Patient p WHERE p.id = ?`,
        iso(randomWorkingDay(historyStart, addDays(historyStart, 60))),
        pick(["A+", "A+", "O+", "O+", "B+", "AB+", "A-", "O-"]),
        pick(["Sidi Bel Abbès", "Oran", "Tlemcen", "Mascara", "Aïn Témouchent"]),
        p.categorie === "Etudiant" ? "Célibataire" : pick(["Marié", "Célibataire"]),
        taille, Math.round(taille - 100 + int(-8, 12)), fume, fume ? int(5, 20) : null,
        chance(0.15) ? "Asthme léger depuis l'enfance" : null,
        chance(0.2) ? pick(["Pénicilline", "Pollen", "Arachides", "Aspirine"]) : null,
        p.id
      );
    }

    // Past consultations, with exams, prescriptions and diagnoses.
    const lastPast = addDays(now, -1);
    for (let i = 0; i < 420; i++) {
      const p = pick(patients);
      const date = randomWorkingDay(historyStart, lastPast);
      // fewer visits during summer holidays
      if ([6, 7].includes(date.getMonth()) && chance(0.85)) continue;
      const heure = randomSlot();
      const motif = pick(MOTIFS);
      const rdv = run(
        "INSERT INTO rendezVous (id_patient, date, heure, motif, statut, email) VALUES (?, ?, ?, ?, 'terminé', ?)",
        p.id, iso(date), heure, motif, p.email
      ).id;
      const consultation = run(
        `INSERT INTO Consultation (patient_id, date, type, symptomes, observations, diagnostic, motif, id_rendezVous)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        p.id, iso(date), pick(["routine", "routine", "urgence", "suivi"]), motif,
        "Examen clinique réalisé.", pick(DIAGNOSTICS), motif, rdv
      ).id;
      if (chance(0.5)) {
        const poids = int(52, 95);
        const taille = int(155, 190);
        run(
          `INSERT INTO Examen_Medical (consultation_id, poids, taille, IMC, tension, vision_d, vision_g,
             audition_d, audition_g, toux, cephalies, fonction_respiratoire)
           VALUES (?, ?, ?, ?, ?, '10/10', '10/10', 'Normale', 'Normale', ?, ?, 'Normale')`,
          consultation, poids, taille, Math.round((poids / (taille / 100) ** 2) * 10) / 10,
          `${int(11, 14)}/${int(7, 9)}`, chance(0.3), chance(0.3)
        );
      }
      if (chance(0.6)) {
        const ord = run("INSERT INTO Ordonnance (date, consultation_id) VALUES (?, ?)", iso(date), consultation).id;
        const meds = new Set(Array.from({ length: int(1, 3) }, () => pick(medicamentIds)));
        for (const med of meds) {
          run(
            "INSERT INTO MedicamentsInOrdonnance (ordonnance_id, medicament_id, duree) VALUES (?, ?, ?)",
            ord, med, pick(["3 jours", "5 jours", "1 semaine", "10 jours", "1 mois"])
          );
        }
      }
      if (chance(0.22)) {
        const contagieuse = chance(0.65);
        const maladie = pick(maladies.filter((m) => m.type === (contagieuse ? "contagieuse" : "cronique")));
        run(
          "INSERT INTO Patient_Maladie (id_patient, id_maladie, date_diagnostic) VALUES (?, ?, ?)",
          p.id, maladie.id, iso(date)
        );
      }
    }

    // Upcoming and cancelled appointments.
    for (let i = 0; i < 18; i++) {
      const p = pick(patients);
      const date = randomWorkingDay(now, addDays(now, 21));
      const heure = randomSlot();
      if (get("SELECT 1 FROM rendezVous WHERE date = ? AND heure = ?", iso(date), heure)) continue;
      run(
        "INSERT INTO rendezVous (id_patient, date, heure, motif, statut, email) VALUES (?, ?, ?, ?, ?, ?)",
        p.id, iso(date), heure, pick(MOTIFS), chance(0.85) ? "programmé" : "annulé", p.email
      );
    }

    // Pending requests from patients.
    for (let i = 0; i < 6; i++) {
      const p = pick(patients);
      const motif = pick(MOTIFS);
      const demande = run(
        "INSERT INTO demande (id_patient, motif, date_depot) VALUES (?, ?, ?)",
        p.id, motif, iso(addDays(now, -int(0, 5)))
      ).id;
      run(
        "INSERT INTO rendezVous (id_patient, id_demande, motif, statut, email) VALUES (?, ?, ?, 'demandé', ?)",
        p.id, demande, motif, p.email
      );
    }

    for (const p of patients.slice(0, 5)) {
      run(
        "INSERT INTO Notification (user_email, title, content, type) VALUES (?, ?, ?, 'scheduled')",
        p.email, "Rappel", "Pensez à votre visite médicale annuelle.",
      );
    }
  });
};

module.exports = { seed, DEMO_PASSWORD };

// `npm run seed`: recreate the database from scratch.
if (require.main === module) {
  const fs = require("node:fs");
  const { dbFile } = require("../config");
  for (const suffix of ["", "-wal", "-shm"]) fs.rmSync(dbFile + suffix, { force: true });
  const db = require("./index");
  seed(db);
  const count = (table) => db.get(`SELECT COUNT(*) AS n FROM ${table}`).n;
  console.log(
    `Database created: ${count("Patient")} patients, ${count("Consultation")} consultations, ` +
      `${count("rendezVous")} rendez-vous. Password for every account: ${DEMO_PASSWORD}`
  );
}
