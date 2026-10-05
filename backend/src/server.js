const db = require("./db");
const { seed, DEMO_PASSWORD } = require("./db/seed");
const app = require("./app");
const { port } = require("./config");

// First start: fill the empty database with demo data.
if (db.get("SELECT COUNT(*) AS n FROM Utilisateur").n === 0) {
  seed(db);
  console.log(`Demo data created (password for every account: ${DEMO_PASSWORD}).`);
}

app.listen(port, () => {
  console.log(`EduCare API running on http://localhost:${port}`);
});
