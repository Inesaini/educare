const express = require("express");
const { all, run } = require("../db");
const { doctor, selfOrStaff, ownerOrStaff, OWNER_SQL } = require("../middleware/auth");
const { notify } = require("../services/rendezvous");

const router = express.Router();

router.get("/:email", selfOrStaff, (req, res) => {
  res.json({
    success: true,
    notifications: all(
      "SELECT * FROM Notification WHERE user_email = ? ORDER BY created_at DESC, id DESC",
      req.params.email.toLowerCase()
    ),
  });
});

router.post("/", doctor, (req, res) => {
  const { user_email, title, content, type } = req.body;
  if (!user_email) return res.status(400).json({ success: false, message: "user_email is required" });
  const allowed = ["accepted", "refused", "scheduled", "other"];
  const created = notify(user_email.toLowerCase(), title, content, allowed.includes(type) ? type : "other");
  res.json({ success: true, message: "Notification created", id: created.id });
});

router.patch("/:id/read", ownerOrStaff(OWNER_SQL.notification, "id"), (req, res) => {
  run("UPDATE Notification SET is_read = 1 WHERE id = ?", req.params.id);
  res.json({ success: true, message: "Notification marked as read" });
});

module.exports = router;
