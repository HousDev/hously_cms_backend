const db = require("../config/db");

// GET ALL
const getDepartments = (req, res) => {
  db.query("SELECT * FROM departments", (err, result) => {
    if (err) return res.status(500).json({ message: "Error" });
    res.json(result);
  });
};

// ADD NEW (custom)
const addDepartment = (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ message: "Name required" });

  db.query(
    "INSERT INTO departments (name) VALUES (?)",
    [name],
    (err) => {
      if (err) return res.status(500).json({ message: "Error" });
      res.json({ message: "Department added" });
    }
  );
};

module.exports = { getDepartments, addDepartment };