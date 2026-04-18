const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLogin = (req, res) => {
  const { email, password } = req.body;

  console.log("👉 Incoming:", email, password);

  const sql = "SELECT * FROM admins WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    console.log("👉 Query executed");

    if (err) {
      console.log("❌ DB Error:", err);
      return res.status(500).json({ message: "DB Error" });
    }

    console.log("👉 DB Result:", result);

    if (result.length === 0) {
      return res.status(401).json({ message: "Admin not found" });
    }

    const admin = result[0];

    let isMatch = false;

    try {
      isMatch = await bcrypt.compare(password, admin.password);
      console.log("👉 Password Match:", isMatch);
    } catch (error) {
      console.log("❌ Bcrypt Error:", error);
      return res.status(500).json({ message: "Password compare error" });
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      "secretkey",
      { expiresIn: "1d" }
    );

    console.log("✅ Login Success");

    return res.json({
      message: "Login successful",
      token,
    });
  });
};

// GET PROFILE
const getProfile = (req, res) => {
  const id = 1; // later from token

  db.query("SELECT * FROM admin_users WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error" });
    res.json(result[0]);
  });
};

// UPDATE PROFILE
const updateProfile = (req, res) => {
  const id = 1;
  const { full_name, username, email, phone } = req.body;

  db.query(
    `UPDATE admin_users SET full_name=?, username=?, email=?, phone=? WHERE id=?`,
    [full_name, username, email, phone, id],
    (err) => {
      if (err) return res.status(500).json({ message: "Update failed" });
      res.json({ message: "Profile updated" });
    }
  );
};

module.exports = { adminLogin, getProfile, updateProfile };