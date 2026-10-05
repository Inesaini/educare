const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const { dbFile } = require("../config");

fs.mkdirSync(path.dirname(dbFile), { recursive: true });
const db = new DatabaseSync(dbFile);
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
db.exec(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));

// node:sqlite only binds numbers, strings, null and buffers.
const toParam = (value) => {
  if (value === undefined || value === "") return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value;
};
const bind = (params) => params.map(toParam);

const all = (sql, ...params) => db.prepare(sql).all(...bind(params));
const get = (sql, ...params) => db.prepare(sql).get(...bind(params)) ?? null;
const run = (sql, ...params) => {
  const result = db.prepare(sql).run(...bind(params));
  return { changes: Number(result.changes), id: Number(result.lastInsertRowid) };
};

// Runs fn inside a transaction; any thrown error rolls everything back.
const transaction = (fn) => {
  db.exec("BEGIN");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
};

const today = () => new Date().toISOString().slice(0, 10);

module.exports = { db, all, get, run, transaction, today };
