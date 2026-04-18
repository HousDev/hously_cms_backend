const db = require("../config/db");

/* ---------------- ORDER SHIFT ---------------- */
const shiftOrder = (order, callback) => {
  const sql = `
    UPDATE services 
    SET display_order = display_order + 1 
    WHERE display_order >= ?
  `;
  db.query(sql, [order], callback);
};

/* ---------------- GET MAX ORDER ---------------- */
const getMaxOrder = (callback) => {
  db.query("SELECT MAX(display_order) as max FROM services", (err, result) => {
    if (err) return callback(err);
    callback(null, result[0].max || 0);
  });
};

/* ---------------- CREATE SERVICE ---------------- */
const createService = (req, res) => {

    console.log("BODY:", req.body);
console.log("FILE:", req.file);
  try {
    let {
      title,
      short_desc,
      full_desc,
      display_order,
      icon_type,
      icon_value,
      is_active,
      meta_title,
      meta_description,
    } = req.body;

    /* ---------- VALIDATION ---------- */
    if (!title || title.length < 3) {
      return res.status(400).json({ message: "Title min 3 characters" });
    }

    if (!short_desc || short_desc.length < 20) {
      return res.status(400).json({ message: "Short description min 20 characters" });
    }

    if (!full_desc || full_desc.length < 50) {
      return res.status(400).json({ message: "Full description min 50 characters" });
    }

    /* ---------- ORDER FIX ---------- */
    let order = parseInt(display_order);
    if (!order || order < 1) order = 1;

    /* ---------- ACTIVE FIX ---------- */
    const isActive = is_active === "true" || is_active === true ? 1 : 0;

    /* ---------- ICON HANDLING ---------- */
    let finalIcon = "";

    if (icon_type === "custom" && req.file) {
      finalIcon = `http://localhost:5000/uploads/${req.file.filename}`;
    } else if (icon_type === "lucide" && icon_value) {
      finalIcon = icon_value;
    } else {
      return res.status(400).json({ message: "Icon required" });
    }

    /* ---------- ORDER LOGIC ---------- */
    getMaxOrder((err, maxOrder) => {
      if (err) return res.status(500).json({ message: "Order error" });

      if (order > maxOrder + 1) order = maxOrder + 1;

      shiftOrder(order, (err) => {
        if (err) return res.status(500).json({ message: "Shift failed" });

        const sql = `
          INSERT INTO services 
          (title, short_desc, full_desc, icon_type, icon_value, display_order, is_active, meta_title, meta_description)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
          sql,
          [
            title,
            short_desc,
            full_desc,
            icon_type,
            finalIcon,
            order,
            isActive,
            meta_title,
            meta_description,
          ],
          (err) => {
            if (err) {
              console.log("DB ERROR:", err);
              return res.status(500).json({ message: "Create failed" });
            }

            res.json({ message: "Service created successfully" });
          }
        );
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- GET ALL ---------------- */
const getAllServices = (req, res) => {
  const sql = `SELECT * FROM services ORDER BY display_order ASC`;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Error" });
    res.json(result);
  });
};

/* ---------------- GET ACTIVE ---------------- */
const getActiveServices = (req, res) => {
  const sql = `
    SELECT * FROM services 
    WHERE is_active = 1 
    ORDER BY display_order ASC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Error" });
    res.json(result);
  });
};

/* ---------------- UPDATE ---------------- */
const updateService = (req, res) => {
  const { id } = req.params;

  let {
    title,
    short_desc,
    full_desc,
    display_order,
    icon_type,
    icon_value,
    is_active,
    meta_title,
    meta_description,
  } = req.body;

  const isActive = is_active === "true" || is_active === true ? 1 : 0;

  let finalIcon = icon_value;

  if (icon_type === "custom" && req.file) {
    finalIcon = `http://localhost:5000/uploads/${req.file.filename}`;
  }

  const sql = `
    UPDATE services SET
    title=?, short_desc=?, full_desc=?, icon_type=?, icon_value=?,
    display_order=?, is_active=?, meta_title=?, meta_description=?
    WHERE id=?
  `;

  db.query(
    sql,
    [
      title,
      short_desc,
      full_desc,
      icon_type,
      finalIcon,
      display_order,
      isActive,
      meta_title,
      meta_description,
      id,
    ],
    (err) => {
      if (err) return res.status(500).json({ message: "Update failed" });
      res.json({ message: "Service updated" });
    }
  );
};

/* ---------------- DELETE ---------------- */
const deleteService = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM services WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Delete failed" });
    res.json({ message: "Deleted" });
  });
};

/* ---------------- TOGGLE STATUS ---------------- */
const toggleServiceStatus = (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  db.query(
    "UPDATE services SET is_active=? WHERE id=?",
    [is_active, id],
    (err) => {
      if (err) return res.status(500).json({ message: "Status update failed" });
      res.json({ message: "Updated" });
    }
  );
};

module.exports = {
  createService,
  getAllServices,
  getActiveServices,
  updateService,
  deleteService,
  toggleServiceStatus,
};