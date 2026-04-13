const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("🚀 Server Running");
});

// ✅ Get Users
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Fetch Error:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result);
  });
});

// ✅ Insert User
app.post("/users", (req, res) => {
  const { name, email } = req.body;

  const sql = "INSERT INTO users (name, email) VALUES (?, ?)";

  db.query(sql, [name, email], (err, result) => {
    if (err) {
      console.error("❌ Insert Error:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json({
      message: "✅ User Added Successfully",
      id: result.insertId,
    });
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
