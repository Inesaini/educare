const { run } = require("../db");

const notify = (user_email, title, content, type = "other") =>
  run(
    "INSERT INTO Notification (user_email, title, content, type) VALUES (?, ?, ?, ?)",
    user_email, title, content, type
  );

// Next working slot: no Friday/Saturday, lunch break 12h-14h, day from 8h to 16h.
const moveToWorkingSlot = (date) => {
  for (;;) {
    if ([5, 6].includes(date.getDay())) {
      date.setDate(date.getDate() + 1);
      date.setHours(8, 0, 0, 0);
      continue;
    }
    const hour = date.getHours();
    if (hour < 8) date.setHours(8, 0, 0, 0);
    else if (hour >= 12 && hour < 14) date.setHours(14, 0, 0, 0);
    else if (hour >= 16) {
      date.setDate(date.getDate() + 1);
      date.setHours(8, 0, 0, 0);
      continue;
    }
    return date;
  }
};

const pad = (n) => String(n).padStart(2, "0");
const localDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const localTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

// "09:30:00" -> "09:30"
const normalizeTime = (value) => (value ? String(value).slice(0, 5) : null);

module.exports = { notify, moveToWorkingSlot, localDate, localTime, normalizeTime };
