const db = require("../config/db");

// SHIFT ORDER
const shiftOrder = (order, callback) => {
  const sql = `
    UPDATE testimonials
    SET display_order = display_order + 1
    WHERE display_order >= ?
  `;
  db.query(sql, [order], callback);
};

// CREATE
const createTestimonial = (req, res) => {
  const {
    client_name,
    role,
    testimonial,
    rating,
    display_order,
    is_active,
  } = req.body;

  if (!client_name) return res.status(400).json({ message: "Name required" });
  if (!role) return res.status(400).json({ message: "Role required" });
  if (!testimonial) return res.status(400).json({ message: "Testimonial required" });
  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ message: "Rating must be 1-5" });

  let image_url = "";

  if (req.file) {
    image_url = `http://localhost:5000/uploads/testimonials/${req.file.filename}`;
  } else {
    return res.status(400).json({ message: "Image required" });
  }

  const order = parseInt(display_order) || 0;
  const active = is_active === "true" || is_active === true ? 1 : 0;

  shiftOrder(order, (err) => {
    if (err) return res.status(500).json({ message: "Order shift failed" });

    const sql = `
      INSERT INTO testimonials
      (client_name, role, testimonial, rating, image_url, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [client_name, role, testimonial, rating, image_url, order, active],
      (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Error" });
        }
        res.json({ message: "Created" });
      }
    );
  });
};

// GET ALL
const getTestimonials = (req, res) => {
  db.query(
    "SELECT * FROM testimonials ORDER BY display_order ASC",
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error" });
      res.json(result);
    }
  );
};

// UPDATE
const updateTestimonial = (req, res) => {
  const { id } = req.params;
  const {
    client_name,
    role,
    testimonial,
    rating,
    display_order,
    is_active,
  } = req.body;

  let image_url = req.body.image_url;

  if (req.file) {
    image_url = `http://localhost:5000/uploads/testimonials/${req.file.filename}`;
  }

  const sql = `
    UPDATE testimonials
    SET client_name=?, role=?, testimonial=?, rating=?, image_url=?, display_order=?, is_active=?
    WHERE id=?
  `;

  db.query(
    sql,
    [client_name, role, testimonial, rating, image_url, display_order, is_active, id],
    (err) => {
      if (err) return res.status(500).json({ message: "Update failed" });
      res.json({ message: "Updated" });
    }
  );
};

// DELETE
const deleteTestimonial = (req, res) => {
  db.query("DELETE FROM testimonials WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Delete failed" });
    res.json({ message: "Deleted" });
  });
};

// TOGGLE STATUS
const toggleStatus = (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  db.query(
    "UPDATE testimonials SET is_active=? WHERE id=?",
    [is_active, id],
    (err) => {
      if (err) return res.status(500).json({ message: "Status failed" });
      res.json({ message: "Updated" });
    }
  );
};

module.exports = {
  createTestimonial,
  getTestimonials,
  updateTestimonial,
  deleteTestimonial,
  toggleStatus,
};