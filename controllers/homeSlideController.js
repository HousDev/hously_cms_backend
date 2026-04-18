// controllers/homeSlideController.js
const db = require("../config/db");

// CREATE SLIDE
// BEFORE INSERT → SHIFT ORDERS
const shiftOrder = (order, callback) => {
  const sql = `
    UPDATE home_slides 
    SET display_order = display_order + 1 
    WHERE display_order >= ?
  `;
  db.query(sql, [order], callback);
};

const createSlide = (req, res) => {

    console.log("BODY:", req.body);
console.log("FILE:", req.file);
  const {
    title,
    subtitle,
    description,
    display_order,
    gradient,
    is_active,
  } = req.body;

  let displayOrder = parseInt(display_order);

  // ❌ if invalid → set default
  if (!displayOrder || displayOrder < 1) {
    displayOrder = 1;
  }
  const isActive = is_active === "true" || is_active === true ? 1 : 0;

  let image_url = "";

  if (req.file) {
    image_url = `http://localhost:5000/uploads/home/${req.file.filename}`;
  } else if (req.body.image_url) {
    image_url = req.body.image_url;
  } else {
    return res.status(400).json({ message: "Image required" });
  }

  shiftOrder(displayOrder, (err) => {
    if (err) {
      console.log("SHIFT ERROR:", err);
      return res.status(500).json({ message: "Order shift failed" });
    }

    const sql = `
      INSERT INTO home_slides 
      (title, subtitle, description, image_url, display_order, gradient, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [title, subtitle, description, image_url, displayOrder, gradient, isActive],
      (err) => {
        if (err) {
          console.log("DB ERROR:", err);
          return res.status(500).json({ message: "Error" });
        }

        res.json({ message: "Slide created" });
      }
    );
  });
};
// GET ALL SLIDES
const getActiveSlides = (req, res) => {
  const sql = `
    SELECT * FROM home_slides 
    WHERE is_active = true 
    ORDER BY display_order ASC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "DB Error" });
    res.json(result);
  });
};

// UPDATE SLIDE
const updateSlide = (req, res) => {
  const { id } = req.params;

  const {
    title,
    subtitle,
    description,
    display_order,
    gradient,
    is_active
  } = req.body;

  let image_url = req.body.image_url; // fallback (old image)

  // ✅ NEW IMAGE UPLOAD
  if (req.file) {
    image_url = `http://localhost:5000/uploads/home/${req.file.filename}`;
  }

  const sql = `
    UPDATE home_slides 
    SET title=?, subtitle=?, description=?, image_url=?, display_order=?, gradient=?, is_active=? 
    WHERE id=?
  `;

  db.query(
    sql,
    [
      title,
      subtitle,
      description,
      image_url,
      display_order,
      gradient,
      is_active,
      id
    ],
    (err) => {
      if (err) {
        console.log("UPDATE ERROR:", err); // 🔥 VERY IMPORTANT
        return res.status(500).json({ message: "Update failed" });
      }
      res.json({ message: "Slide updated" });
    }
  );
};

// DELETE SLIDE
const deleteSlide = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM home_slides WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Delete failed" });
    res.json({ message: "Slide deleted" });
  });
};

// TOGGLE STATUS
const toggleStatus = (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  db.query(
    "UPDATE home_slides SET is_active=? WHERE id=?",
    [is_active, id],
    (err) => {
      if (err) return res.status(500).json({ message: "Status update failed" });
      res.json({ message: "Status updated" });
    }
  );
};

// GET ALL SLIDES (ADMIN)
const getAllSlides = (req, res) => {
  const sql = `
    SELECT * FROM home_slides 
    ORDER BY display_order ASC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "DB Error" });
    res.json(result);
  });
};

module.exports = {
  createSlide,
  getActiveSlides,
  updateSlide,
  getAllSlides,
  deleteSlide,
  toggleStatus
};