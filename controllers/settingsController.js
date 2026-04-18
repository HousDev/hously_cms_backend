const db = require("../config/db");

// GET ALL SETTINGS
const getSettings = (req, res) => {
  db.query("SELECT * FROM settings", (err, result) => {
    if (err) return res.status(500).json({ message: "Error" });

    const data = {};
    result.forEach((r) => {
      data[r.setting_key] = r.setting_value;
    });

    res.json(data);
  });
};

const saveGeneral = (req, res) => {
  const {
    site_title,
    site_description,
    contact_email,
    contact_phone,
    site_url,
  } = req.body;

  const settings = [
    ["site_title", site_title],
    ["site_description", site_description],
    ["contact_email", contact_email],
    ["contact_phone", contact_phone],
    ["site_url", site_url],
  ];

  settings.forEach(([key, value]) => {
    db.query(
      `INSERT INTO settings (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value=?`,
      [key, value, value]
    );
  });

  res.json({ message: "General settings saved" });
};

const saveAppearance = (req, res) => {
  const files = req.files;

  const updates = [];

  if (files.navbar_logo) {
    updates.push([
      "navbar_logo",
      `http://localhost:5000/uploads/settings/${files.navbar_logo[0].filename}`,
    ]);
  }

  if (files.footer_logo) {
    updates.push([
      "footer_logo",
      `http://localhost:5000/uploads/settings/${files.footer_logo[0].filename}`,
    ]);
  }

  if (files.favicon) {
    updates.push([
      "favicon",
      `http://localhost:5000/uploads/settings/${files.favicon[0].filename}`,
    ]);
  }

  updates.forEach(([key, value]) => {
    db.query(
      `INSERT INTO settings (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value=?`,
      [key, value, value]
    );
  });

  res.json({ message: "Appearance updated" });
};

module.exports = {
  getSettings,
  saveGeneral,
  saveAppearance,
};