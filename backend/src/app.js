const express = require("express");
const cors = require("cors");
const config = require("./config");
const { run } = require("./db");

const app = express();

app.use(cors({ origin: config.corsOrigins }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
// Express 5 leaves req.body undefined when there is no body.
app.use((req, res, next) => {
  req.body ??= {};
  next();
});

app.use("/uploads", express.static(config.uploadsDir));

app.get("/", (req, res) => res.json({ name: "EduCare API", status: "ok" }));

app.use("/patients", require("./routes/patients"));
app.use("/medecins", require("./routes/medecins"));
app.use("/medecins", require("./routes/stats"));
app.use("/admin", require("./routes/admin"));
app.use("/directeur", require("./routes/directeur"));
app.use("/directeur", require("./routes/stats"));
app.use("/notifications", require("./routes/notifications"));

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || (err.name === "MulterError" ? 400 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? "Server error" : err.message });
});

// Expired blacklisted tokens are useless: purge them at startup and daily.
const purgeTokens = () => run("DELETE FROM blacklisted_tokens WHERE expires_at < ?", new Date().toISOString());
purgeTokens();
setInterval(purgeTokens, 24 * 60 * 60 * 1000).unref();

module.exports = app;
