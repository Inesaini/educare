const path = require("node:path");
const crypto = require("node:crypto");
require("dotenv").config({ quiet: true });

const root = path.resolve(__dirname, "..");

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production (see .env.example)");
  }
  // In development a random secret is fine: sessions just end when the server restarts.
  jwtSecret = crypto.randomBytes(32).toString("hex");
  console.warn("JWT_SECRET not set, using a random one (logins reset on restart).");
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret,
  dbFile: path.resolve(root, process.env.DB_FILE || "data/educare.db"),
  uploadsDir: path.resolve(root, "uploads"),
  // Only these addresses can create an account (school email domain).
  emailDomain: process.env.EMAIL_DOMAIN || "esi-sba.dz",
  backendUrl: process.env.BACKEND_URL || `http://localhost:${Number(process.env.PORT) || 3000}`,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
  },
};
