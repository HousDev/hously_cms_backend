const db = require("../config/db");

// GET ALL CATEGORIES
const getCategories = (req, res) => {
  db.query("SELECT * FROM blog_categories", (err, result) => {
    if (err) return res.status(500).json({ message: "DB Error" });
    res.json(result);
  });
};

module.exports = { getCategories };