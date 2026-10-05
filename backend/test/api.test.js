const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "educare-test-"));
process.env.DB_FILE = path.join(dir, "test.db");
process.env.JWT_SECRET = "test-secret";

const db = require("../src/db");
const { seed, DEMO_PASSWORD } = require("../src/db/seed");
const app = require("../src/app");

let server;
let base;
const tokens = {};
const patientEmail = () => db.get("SELECT u.email FROM Utilisateur u JOIN Patient p ON p.utilisateur_id = u.id WHERE p.categorie = 'Etudiant' AND u.verified = 1 LIMIT 1").email;

const api = async (method, url, { token, body } = {}) => {
  const res = await fetch(base + url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
};

const login = async (email, password = DEMO_PASSWORD) => {
  const res = await api("POST", "/patients/login/", { body: { email, password } });
  assert.equal(res.status, 200, JSON.stringify(res.data));
  return res.data;
};

before(async () => {
  seed(db);
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
  for (const [role, email] of Object.entries({
    admin: "admin@esi-sba.dz",
    medecin: "medecin@esi-sba.dz",
    directeur: "directeur@esi-sba.dz",
  })) {
    const data = await login(email);
    assert.equal(data.patient.role, role);
    tokens[role] = data.token;
  }
  tokens.patient = (await login(patientEmail())).token;
});

after(() => {
  server.close();
  fs.rmSync(dir, { recursive: true, force: true });
});

test("login rejects a wrong password", async () => {
  const res = await api("POST", "/patients/login", { body: { email: "medecin@esi-sba.dz", password: "nope" } });
  assert.equal(res.status, 401);
});

test("protected routes need the right role", async () => {
  assert.equal((await api("GET", "/medecins/listedesrendezvous")).status, 401);
  assert.equal((await api("GET", "/medecins/listedesrendezvous", { token: tokens.patient })).status, 403);
  assert.equal((await api("GET", "/Admin/get-users", { token: tokens.medecin })).status, 403);
  assert.equal((await api("GET", "/directeur/patientCount", { token: tokens.patient })).status, 403);
  assert.equal((await api("GET", "/directeur/patientCount", { token: tokens.directeur })).status, 200);
});

test("a patient only sees their own data", async () => {
  const me = patientEmail();
  const other = db.get("SELECT email FROM Utilisateur WHERE email != ? AND id IN (SELECT utilisateur_id FROM Patient) LIMIT 1", me).email;
  assert.notEqual((await api("GET", `/patients/consultations/${me}`, { token: tokens.patient })).status, 403);
  assert.equal((await api("GET", `/patients/consultations/${other}`, { token: tokens.patient })).status, 403);
  const foreign = db.get(
    `SELECT c.id_consultation FROM Consultation c JOIN Patient p ON p.id = c.patient_id
     JOIN Utilisateur u ON u.id = p.utilisateur_id WHERE u.email = ? LIMIT 1`,
    other
  );
  if (foreign) {
    const res = await api("GET", `/patients/examen-medical/by-consultation/${foreign.id_consultation}`, { token: tokens.patient });
    assert.equal(res.status, 403);
  }
});

test("doctor flow: consultation, exam, prescription", async () => {
  const email = patientEmail();
  const t = tokens.medecin;
  const created = await api("POST", `/medecins/consultation-create/${email}`, {
    token: t,
    body: { type: "routine", motif: "Fièvre", symptomes: "Fièvre", diagnostic: "Grippe" },
  });
  assert.equal(created.status, 201);
  const id = created.data.id_consultation;

  const got = await api("GET", `/medecins/get-consultation/${id}`, { token: t });
  assert.equal(got.data[0].motif, "Fièvre");

  const modified = await api("PATCH", `/medecins/modify-consultation/${id}`, {
    token: t,
    body: { diagnostic: "Angine", patient_id: 999, "x`; DROP TABLE Patient; --": 1 },
  });
  assert.equal(modified.status, 200);
  assert.equal(db.get("SELECT diagnostic FROM Consultation WHERE id_consultation = ?", id).diagnostic, "Angine");

  assert.equal((await api("GET", `/medecins/consultations/${id}/has-examen-medical`, { token: t })).data.exists, false);
  const exam = await api("POST", `/medecins/examen-medical-create/${id}`, {
    token: t,
    body: { poids: 70, taille: 175, tension: "12/8", toux: true, unknown_column: 1 },
  });
  assert.equal(exam.status, 201);
  assert.equal((await api("GET", `/medecins/consultations/${id}/examen-medical`, { token: t })).data.data.tension, "12/8");

  const ord = await api("POST", `/medecins/create-ordonnance/${id}`, { token: t });
  assert.equal(ord.status, 201);
  const search = await api("GET", "/medecins/search-medicament?q=doli", { token: t });
  assert.ok(search.data.results.length > 0);
  const med = search.data.results[0];
  const added = await api("POST", `/medecins/add-medicament/${ord.data.id_ordonnance}/${med.id}`, {
    token: t,
    body: { duree: "5 jours" },
  });
  assert.equal(added.status, 201);
  const meds = await api("GET", `/medecins/consultations/${id}/medicaments`, { token: t });
  assert.equal(meds.data.medicaments[0].nom_de_marque, med.nom_de_marque);

  // the patient can read their own prescription
  const own = await api("GET", `/patients/ordonnance/by-consultation/${id}`, { token: tokens.patient });
  assert.equal(own.status, 200);
  assert.equal(own.data.medicaments.length, 1);
});

test("appointments: request, schedule, cancel", async () => {
  const email = patientEmail();
  const req = await api("POST", `/patients/demanderdv/${email}`, { token: tokens.patient, body: { motif: "Douleur" } });
  assert.equal(req.status, 201);
  const id = req.data.id_rdv;
  const demandes = await api("GET", "/medecins/listedesdemandes", { token: tokens.medecin });
  assert.ok(demandes.data.some((d) => d.id_rendezVous === id));

  const scheduled = await api("PUT", `/medecins/programmerdv/${id}`, {
    token: tokens.medecin,
    body: { email, date_rdv: "2099-01-05", heure_rdv: "09:00" },
  });
  assert.equal(scheduled.status, 200);
  const clash = await api("POST", "/medecins/programmerrdvdirect", {
    token: tokens.medecin,
    body: { email, date_rdv: "2099-01-05", heure_rdv: "09:00", motif: "x" },
  });
  assert.equal(clash.status, 400);

  const cancelled = await api("DELETE", `/medecins/rendezvous/${id}`, { token: tokens.medecin });
  assert.equal(cancelled.status, 200);
  const list = await api("GET", "/medecins/listedesrendezvous", { token: tokens.medecin });
  assert.equal(list.data.find((r) => r.id_rendezVous === id).statut, "annulé");
  const notes = await api("GET", `/notifications/${email}`, { token: tokens.patient });
  assert.ok(notes.data.notifications.some((n) => n.title === "Rendez-vous annulé"));
});

test("dossier médical create and update", async () => {
  const email = db.get(
    `SELECT u.email FROM Utilisateur u JOIN Patient p ON p.utilisateur_id = u.id
     WHERE p.categorie != 'Directeur' AND u.id NOT IN (SELECT utilisateur_id FROM Dossier_Medical) LIMIT 1`
  ).email;
  const t = tokens.medecin;
  assert.equal((await api("GET", `/medecins/get-dossier-medical/${email}`, { token: t })).status, 404);
  const created = await api("POST", `/medecins/dossier-medical-create/${email}`, {
    token: t,
    body: { groupeSanguin: "A+", taille: "180", tabac_fume: "oui", alcool: "non" },
  });
  assert.equal(created.status, 201);
  assert.equal(created.data.dossier.tabac_fume, 1);
  const updated = await api("PUT", `/medecins/medical-records-update/${email}`, { token: t, body: { poids: "72.5" } });
  assert.equal(updated.data.dossier.poids, 72.5);
});

test("statistics have the shapes the dashboards expect", async () => {
  const now = new Date();
  const year = now.getMonth() >= 8 ? now.getFullYear() + 1 : now.getFullYear();
  const t = tokens.directeur;
  const parMois = await api("GET", `/directeur/getConsultationsParMois/${year - 1}`, { token: t });
  assert.equal(parMois.data.length, 9);
  assert.equal(parMois.data[0].name, "septembre");
  assert.ok(parMois.data.some((m) => m.value > 0));
  const cat = await api("GET", `/directeur/getConsultationsParCategorieAnnuelle/${year - 1}`, { token: t });
  assert.deepEqual(cat.data.map((c) => c.name), ["Etudiant", "Enseignant", "ATS"]);
  const table = await api("GET", `/directeur/consultation_stats/${year - 1}`, { token: t });
  assert.ok(table.data.length > 0);
  assert.ok(["mois", "total", "etudiants", "enseignants", "ats", "jourDePointe"].every((k) => k in table.data[0]));
  const maladies = await api("GET", `/directeur/getStatsMaladies/Contagieuse/${year - 1}`, { token: t });
  assert.ok(maladies.data.length > 0);
  assert.ok("repartition_sexe" in maladies.data[0] && "pic_mensuel" in maladies.data[0]);
  const top = await api("GET", "/medecins/getMedicamentsPlusPrescrits", { token: tokens.medecin });
  assert.ok(top.data.length > 0);
});

test("admin: create, disable, archive and restore accounts", async () => {
  const t = tokens.admin;
  const created = await api("POST", "/medecins/register", {
    token: t,
    body: { first_name: "Test", last_name: "Docteur", email: "t.docteur@esi-sba.dz", password: "secret123", matricule: "MED-T1", birth_date: "1990-01-01", phone: "0555" },
  });
  assert.equal(created.status, 201);
  assert.equal((await login("t.docteur@esi-sba.dz", "secret123")).patient.role, "medecin");

  assert.equal((await api("PUT", "/admin/edit-medecin-state/t.docteur@esi-sba.dz", { token: t })).status, 200);
  const disabled = await api("POST", "/patients/login", { body: { email: "t.docteur@esi-sba.dz", password: "secret123" } });
  assert.equal(disabled.status, 401);

  const email = patientEmail();
  assert.equal((await api("POST", `/admin/archive-user/${email}`, { token: t })).status, 200);
  assert.ok((await api("GET", "/admin/get-archived-users/", { token: t })).data.utilisateurs.some((u) => u.email === email));
  assert.equal((await api("GET", `/patients/consultations/${email}`, { token: tokens.patient })).status, 401);
  assert.equal((await api("POST", `/admin/restore-user/${email}/`, { token: t })).status, 200);
  tokens.patient = (await login(email)).token;
});

test("registration, activation and password reset", async () => {
  const body = { first_name: "Nouvel", last_name: "Etudiant", email: "n.etudiant@esi-sba.dz", password: "secret123", birth_date: "2004-02-02", phone: "0666", matricule: "ETU-T1", categorie: "Etudiant", sex: "Female" };
  assert.equal((await api("POST", "/patients/register", { body })).status, 201);
  assert.equal((await api("POST", "/patients/register", { body })).status, 400);
  assert.equal((await api("POST", "/patients/register", { body: { ...body, email: "x@gmail.com", matricule: "Z" } })).status, 400);

  const jwt = require("jsonwebtoken");
  const reset = jwt.sign({ email: "n.etudiant@esi-sba.dz", purpose: "reset" }, "test-secret");
  // a reset token is not a login token
  assert.equal((await api("GET", "/patients/consultations/n.etudiant@esi-sba.dz", { token: reset })).status, 401);
  assert.equal((await api("POST", "/patients/set-new-password", { body: { token: reset, newPassword: "nouveau123" } })).status, 200);
  const res = await api("POST", "/patients/login", { body: { email: "n.etudiant@esi-sba.dz", password: "nouveau123" } });
  assert.equal(res.data.patient.verified, false);

  const activation = jwt.sign({ email: "n.etudiant@esi-sba.dz", purpose: "activate" }, "test-secret");
  assert.equal((await api("GET", `/patients/activate/${activation}`)).status, 200);
  assert.equal((await api("GET", "/patients/verify-status/n.etudiant@esi-sba.dz")).data.verified, true);
});

test("logout blacklists the token", async () => {
  const { token } = await login("k.ferhat@esi-sba.dz");
  assert.equal((await api("POST", "/patients/logout", { token })).status, 200);
  assert.equal((await api("GET", "/medecins/listedesrendezvous", { token })).status, 401);
});

const upload = async (url, rows, fields = {}) => {
  const ExcelJS = require("exceljs");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("data");
  rows.forEach((row) => sheet.addRow(row));
  const form = new FormData();
  form.append(
    "file",
    new Blob([await workbook.xlsx.writeBuffer()], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    "import.xlsx"
  );
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  return form;
};

test("Excel imports: accounts and appointments", async () => {
  const accounts = await upload("/admin/bulk-register-pdf", [
    ["prenom", "nom", "email", "password", "naissance", "tel", "matricule", "categorie", "sexe"],
    ["Lea", "Excel", "l.excel@esi-sba.dz", "secret123", "2003-03-03", "0777", "ETU-X1", "Etudiant", "Femme"],
    ["Bad", "Row", "bad@gmail.com", "secret123", "2003-03-03", "0777", "ETU-X2", "Etudiant", "Homme"],
  ]);
  let res = await fetch(`${base}/admin/bulk-register-pdf`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tokens.admin}` },
    body: accounts,
  });
  let data = await res.json();
  assert.deepEqual(data.results.map((r) => r.status), ["success", "failed"]);
  assert.equal(db.get("SELECT sex FROM Patient WHERE matricule = 'ETU-X1'").sex, "Female");

  const schedule = await upload(
    "/medecins/bulk-schedule",
    [["nom", "prenom", "email"], ["Excel", "Lea", "l.excel@esi-sba.dz"], ["X", "Y", "unknown@esi-sba.dz"]],
    { startDate: "2099-03-04", interval: "30" }
  );
  res = await fetch(`${base}/medecins/bulk-schedule`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tokens.medecin}` },
    body: schedule,
  });
  data = await res.json();
  assert.equal(data.results[0].status, "success");
  assert.equal(data.results[0].heure, "08:00");
  assert.equal(data.results[1].status, "failed");
});
