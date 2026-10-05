const bcrypt = require("bcryptjs");
const { get, run, transaction } = require("../db");
const { isSchoolEmail, findUser, normalizeSex } = require("./users");
const { emailDomain } = require("../config");

class AccountError extends Error {}

const CATEGORIES = ["Etudiant", "Enseignant", "ATS"];

// Creates an account. `type` is Patient, Medecin, Directeur or Admin.
// Staff accounts are verified immediately; patients confirm their email.
const createAccount = (type, input) => {
  const {
    first_name,
    last_name,
    email,
    password,
    birth_date,
    phone,
    matricule,
    categorie,
    sex,
    speciality,
  } = input;

  if (!email || !first_name || !last_name || !password || !matricule) {
    throw new AccountError("All fields are required");
  }
  if (type === "Patient" && (!CATEGORIES.includes(categorie) || !sex)) {
    throw new AccountError("All fields are required");
  }
  if (!isSchoolEmail(email)) {
    throw new AccountError(`Email should be in the right format name@${emailDomain}`);
  }
  if (String(password).length < 6) {
    throw new AccountError("Password must be at least 6 characters");
  }
  if (findUser(email)) {
    throw new AccountError("User already exists");
  }
  if (
    (type === "Medecin" && get("SELECT 1 FROM Medecin WHERE matricule = ?", matricule)) ||
    (type !== "Medecin" && type !== "Admin" && get("SELECT 1 FROM Patient WHERE matricule = ?", matricule))
  ) {
    throw new AccountError("Matricule already used");
  }

  const hash = bcrypt.hashSync(String(password), 10);
  return transaction(() => {
    const user = run(
      "INSERT INTO Utilisateur (email, password, verified) VALUES (?, ?, ?)",
      email.toLowerCase(),
      hash,
      type !== "Patient" || input.verified === true
    );
    const created = { utilisateurId: user.id, matricule };

    if (type === "Admin") {
      run("INSERT INTO Admin (utilisateur_id) VALUES (?)", user.id);
    } else if (type === "Medecin") {
      created.medecinId = run(
        `INSERT INTO Medecin (utilisateur_id, matricule, nom, prenom, num_tel, date_naissance, speciality)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        user.id, matricule, last_name, first_name, phone, birth_date, speciality
      ).id;
    } else {
      created.patientId = run(
        `INSERT INTO Patient (utilisateur_id, categorie, matricule, nom, prenom, sex, num_tel, date_naissance)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        user.id,
        type === "Directeur" ? "Directeur" : categorie,
        matricule, last_name, first_name, normalizeSex(sex), phone, birth_date
      ).id;
      if (type === "Directeur") {
        run("INSERT INTO Directeur (patient_id) VALUES (?)", created.patientId);
      }
    }
    return created;
  });
};

module.exports = { createAccount, AccountError, CATEGORIES };
