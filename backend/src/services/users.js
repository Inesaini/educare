const { get } = require("../db");
const { emailDomain } = require("../config");

const isSchoolEmail = (email) =>
  typeof email === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
  email.toLowerCase().endsWith(`@${emailDomain}`);

const findUser = (email) => get("SELECT * FROM Utilisateur WHERE email = ?", email);

const findPatientByEmail = (email) =>
  get(
    `SELECT p.* FROM Patient p JOIN Utilisateur u ON u.id = p.utilisateur_id
     WHERE u.email = ?`,
    email
  );

// Staff tables first: a director also has a Patient row.
const getRole = (userId) => {
  if (get("SELECT 1 FROM Admin WHERE utilisateur_id = ?", userId)) return "admin";
  if (get("SELECT 1 FROM Medecin WHERE utilisateur_id = ?", userId)) return "medecin";
  const patient = get("SELECT id FROM Patient WHERE utilisateur_id = ?", userId);
  if (!patient) return null;
  if (get("SELECT 1 FROM Directeur WHERE patient_id = ?", patient.id)) return "directeur";
  return "patient";
};

// The admin form sends Homme/Femme, the sign-up form Male/Female.
const normalizeSex = (sex) => {
  if (!sex) return null;
  const value = String(sex).trim().toLowerCase();
  if (["male", "homme", "m", "h"].includes(value)) return "Male";
  if (["female", "femme", "f"].includes(value)) return "Female";
  return null;
};

module.exports = { isSchoolEmail, findUser, findPatientByEmail, getRole, normalizeSex };
