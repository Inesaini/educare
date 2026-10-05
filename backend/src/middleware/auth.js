const jwt = require("jsonwebtoken");
const { get } = require("../db");
const { jwtSecret } = require("../config");
const { getRole } = require("../services/users");

const bearer = (req) => {
  const header = req.get("Authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
};

// Login tokens only: activation and password-reset tokens carry a "purpose".
const authenticate = (req, res, next) => {
  const token = bearer(req);
  if (!token) return res.status(401).json({ message: "Access Denied" });
  if (get("SELECT 1 FROM blacklisted_tokens WHERE token = ?", token)) {
    return res.status(401).json({ message: "Token blacklisted. Please login again." });
  }
  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    return res.status(401).json({ message: "Invalid or Expired Token" });
  }
  if (payload.purpose || !payload.id) {
    return res.status(401).json({ message: "Invalid or Expired Token" });
  }
  const user = get("SELECT id, email, archived_at FROM Utilisateur WHERE id = ?", payload.id);
  if (!user || user.archived_at) {
    return res.status(401).json({ message: "Account not active" });
  }
  const role = getRole(user.id);
  if (role === "medecin" && get("SELECT archive FROM Medecin WHERE utilisateur_id = ?", user.id).archive) {
    return res.status(401).json({ message: "Account disabled" });
  }
  req.user = { id: user.id, email: user.email, role };
  next();
};

const allow = (...roles) => [
  authenticate,
  (req, res, next) => {
    if (roles.includes(req.user.role)) return next();
    return res.status(403).json({ message: "Access Denied" });
  },
];

// The patient named in the URL (or body), or a doctor/admin.
const selfOrStaff = [
  authenticate,
  (req, res, next) => {
    const email = (req.params.email || req.body.email || "").toLowerCase();
    if (email && email === req.user.email.toLowerCase()) return next();
    if (["medecin", "admin"].includes(req.user.role)) return next();
    return res.status(403).json({ message: "Accès refusé" });
  },
];

// For routes addressed by id: `ownerSql` returns the owner's email for that id.
const ownerOrStaff = (ownerSql, param) => [
  authenticate,
  (req, res, next) => {
    if (["medecin", "admin"].includes(req.user.role)) return next();
    const row = get(ownerSql, req.params[param]);
    if (row && row.email.toLowerCase() === req.user.email.toLowerCase()) return next();
    return res.status(403).json({ message: "Accès refusé" });
  },
];

const OWNER_SQL = {
  consultation: `SELECT u.email FROM Consultation c
    JOIN Patient p ON p.id = c.patient_id JOIN Utilisateur u ON u.id = p.utilisateur_id
    WHERE c.id_consultation = ?`,
  ordonnance: `SELECT u.email FROM Ordonnance o
    JOIN Consultation c ON c.id_consultation = o.consultation_id
    JOIN Patient p ON p.id = c.patient_id JOIN Utilisateur u ON u.id = p.utilisateur_id
    WHERE o.id_ordonnance = ?`,
  rendezVous: `SELECT u.email FROM rendezVous r
    JOIN Patient p ON p.id = r.id_patient JOIN Utilisateur u ON u.id = p.utilisateur_id
    WHERE r.id_rendezVous = ?`,
  notification: "SELECT user_email AS email FROM Notification WHERE id = ?",
};

module.exports = {
  authenticate,
  allow,
  doctor: allow("medecin"),
  admin: allow("admin"),
  staff: allow("medecin", "directeur", "admin"),
  selfOrStaff,
  ownerOrStaff,
  OWNER_SQL,
  bearer,
};
