const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ GET all notifications
router.get("/", (req, res) => {
  db.query(
    "SELECT * FROM notifications ORDER BY created_at DESC",
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error" });
      res.json(result);
    }
  );
});

// ✅ Mark single as read
router.patch("/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "UPDATE notifications SET is_read = true WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json({ message: "Error" });
      res.json({ message: "Updated" });
    }
  );
});

module.exports = router;