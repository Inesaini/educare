-- EduCare schema (SQLite). Dates are ISO strings: 'YYYY-MM-DD', times 'HH:MM'.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Utilisateur (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password    TEXT NOT NULL,
  verified    INTEGER NOT NULL DEFAULT 0,
  archived_at TEXT
);

CREATE TABLE IF NOT EXISTS Admin (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  utilisateur_id INTEGER NOT NULL UNIQUE REFERENCES Utilisateur(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Medecin (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  utilisateur_id INTEGER NOT NULL UNIQUE REFERENCES Utilisateur(id) ON DELETE CASCADE,
  matricule      TEXT NOT NULL,
  nom            TEXT NOT NULL,
  prenom         TEXT NOT NULL,
  num_tel        TEXT,
  date_naissance TEXT,
  speciality     TEXT,
  archive        INTEGER NOT NULL DEFAULT 0  -- 1 = account disabled by the admin
);

CREATE TABLE IF NOT EXISTS Patient (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  utilisateur_id INTEGER NOT NULL UNIQUE REFERENCES Utilisateur(id) ON DELETE CASCADE,
  categorie      TEXT NOT NULL CHECK (categorie IN ('Etudiant', 'Enseignant', 'ATS', 'Directeur')),
  matricule      TEXT NOT NULL UNIQUE,
  nom            TEXT NOT NULL,
  prenom         TEXT NOT NULL,
  sex            TEXT CHECK (sex IN ('Male', 'Female')),
  num_tel        TEXT,
  date_naissance TEXT,
  photo          TEXT
);

CREATE TABLE IF NOT EXISTS Directeur (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL UNIQUE REFERENCES Patient(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Dossier_Medical (
  id                         INTEGER PRIMARY KEY AUTOINCREMENT,
  utilisateur_id             INTEGER NOT NULL UNIQUE REFERENCES Utilisateur(id) ON DELETE CASCADE,
  date_creation              TEXT NOT NULL,
  groupeSanguin              TEXT CHECK (groupeSanguin IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  numSecuriteSociale         TEXT,
  adresse                    TEXT,
  situation_famille          TEXT,
  taille                     REAL,
  poids                      REAL,
  tabac_fume                 INTEGER,
  tabac_fume_nombre          INTEGER,
  tabac_chique               INTEGER,
  tabac_chique_nombre        INTEGER,
  tabac_pris                 INTEGER,
  tabac_pris_nombre          INTEGER,
  age_pris                   INTEGER,
  ancien_fume                INTEGER,
  periode_exposition         INTEGER,
  alcool                     INTEGER,
  medicaments                TEXT,
  affectionsCongenitales     TEXT,
  maladiesGenerales          TEXT,
  interventionsChirurgicales TEXT,
  reactionsAllergiques       TEXT,
  notes                      TEXT,
  statut                     TEXT,
  nom                        TEXT,
  prenom                     TEXT,
  num_tel                    TEXT,
  date_naissance             TEXT
);

CREATE TABLE IF NOT EXISTS demande (
  id_demande INTEGER PRIMARY KEY AUTOINCREMENT,
  id_patient INTEGER NOT NULL REFERENCES Patient(id) ON DELETE CASCADE,
  motif      TEXT,
  date_depot TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rendezVous (
  id_rendezVous INTEGER PRIMARY KEY AUTOINCREMENT,
  id_patient    INTEGER NOT NULL REFERENCES Patient(id) ON DELETE CASCADE,
  id_demande    INTEGER REFERENCES demande(id_demande) ON DELETE SET NULL,
  date          TEXT,
  heure         TEXT,
  motif         TEXT,
  statut        TEXT NOT NULL CHECK (statut IN ('demandé', 'programmé', 'annulé', 'terminé', 'refusé')),
  email         TEXT
);
CREATE INDEX IF NOT EXISTS idx_rdv_slot ON rendezVous(date, heure);

CREATE TABLE IF NOT EXISTS Consultation (
  id_consultation INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id      INTEGER NOT NULL REFERENCES Patient(id) ON DELETE CASCADE,
  date            TEXT NOT NULL,
  type            TEXT,
  symptomes       TEXT,
  observations    TEXT,
  diagnostic      TEXT,
  piece           TEXT,
  motif           TEXT,
  id_rendezVous   INTEGER REFERENCES rendezVous(id_rendezVous) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_consultation_date ON Consultation(date);

CREATE TABLE IF NOT EXISTS Examen_Medical (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  consultation_id        INTEGER NOT NULL UNIQUE REFERENCES Consultation(id_consultation) ON DELETE CASCADE,
  poids                  REAL,
  taille                 REAL,
  IMC                    REAL,
  tension                TEXT,
  vision_d               TEXT,
  vision_g               TEXT,
  larmoiement            INTEGER,
  douleurs               INTEGER,
  taches_yeux            INTEGER,
  audition_d             TEXT,
  audition_g             TEXT,
  sifflements            INTEGER,
  angines                INTEGER,
  epistaxis              INTEGER,
  rhinorrhee             INTEGER,
  cephalies              INTEGER,
  vertiges               INTEGER,
  troubles_sommeil       INTEGER,
  peau_normal            INTEGER,
  peau_anormale          INTEGER,
  douleurs_musculaires   INTEGER,
  douleurs_articulaires  INTEGER,
  douleurs_neurologiques INTEGER,
  toux                   INTEGER,
  dyspnee                INTEGER,
  douleurs_thoraciques   INTEGER,
  palpitations           INTEGER,
  oedemes                INTEGER,
  cyanose                INTEGER,
  pyrosis                INTEGER,
  vomissements           INTEGER,
  douleurs_abdominales   INTEGER,
  dysurie                INTEGER,
  hematurie              INTEGER,
  cycles_irreguliers     INTEGER,
  fonction_respiratoire  TEXT,
  fonction_circulatoire  TEXT,
  fonction_motrice       TEXT,
  sanguins               TEXT,
  urinaires              TEXT,
  radiologiques          TEXT,
  hepatites_pos          INTEGER,
  hepatites_neg          INTEGER,
  syphilis_pos           INTEGER,
  syphilis_neg           INTEGER,
  vih_pos                INTEGER,
  vih_neg                INTEGER
);

CREATE TABLE IF NOT EXISTS medicaments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nom_de_marque TEXT NOT NULL,
  forme         TEXT,
  dosage        TEXT,
  cond          TEXT
);

CREATE TABLE IF NOT EXISTS Ordonnance (
  id_ordonnance   INTEGER PRIMARY KEY AUTOINCREMENT,
  date            TEXT NOT NULL,
  consultation_id INTEGER NOT NULL UNIQUE REFERENCES Consultation(id_consultation) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS MedicamentsInOrdonnance (
  ordonnance_id INTEGER NOT NULL REFERENCES Ordonnance(id_ordonnance) ON DELETE CASCADE,
  medicament_id INTEGER NOT NULL REFERENCES medicaments(id),
  duree         TEXT,
  PRIMARY KEY (ordonnance_id, medicament_id)
);

CREATE TABLE IF NOT EXISTS Maladie (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  nom  TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('contagieuse', 'cronique'))
);

CREATE TABLE IF NOT EXISTS Patient_Maladie (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  id_patient      INTEGER NOT NULL REFERENCES Patient(id) ON DELETE CASCADE,
  id_maladie      INTEGER NOT NULL REFERENCES Maladie(id),
  date_diagnostic TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Notification (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  title      TEXT,
  content    TEXT,
  type       TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('accepted', 'refused', 'scheduled', 'other')),
  is_read    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS blacklisted_tokens (
  token      TEXT PRIMARY KEY,
  expires_at TEXT NOT NULL
);
