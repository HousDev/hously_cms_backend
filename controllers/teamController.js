const db = require("../config/db");

// SHIFT ORDER
const shiftOrder = (order, callback) => {
  db.query(
    `UPDATE team_members SET display_order = display_order + 1 WHERE display_order >= ?`,
    [order],
    callback
  );
};

// CREATE
const createMember = (req, res) => {
  const {
    name,
    role,
    description,
    display_order,
    is_active,
    social_links,
  } = req.body;

  if (!name) return res.status(400).json({ message: "Name required" });
  if (!role) return res.status(400).json({ message: "Role required" });

  if (!req.file) {
    return res.status(400).json({ message: "Image required" });
  }

  const image_url = `http://localhost:5000/uploads/team/${req.file.filename}`;

  const links = social_links ? JSON.stringify(JSON.parse(social_links)) : null;

  const order = Number(display_order) || 0;
  const active = is_active === "true" || is_active === true ? 1 : 0;

  shiftOrder(order, (err) => {
    if (err) return res.status(500).json({ message: "Order error" });

    db.query(
      `INSERT INTO team_members 
      (name, role, description, image_url, social_links, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, role, description, image_url, links, order, active],
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

// GET
const getMembers = (req, res) => {
  db.query(
    "SELECT * FROM team_members ORDER BY display_order ASC",
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error" });

      // convert JSON
      const data = result.map((r) => ({
        ...r,
       social_links: (() => {
        try {
            return typeof r.social_links === "string"
            ? JSON.parse(r.social_links)
            : r.social_links || [];
        } catch {
            return [];
        }
        })(),
      }));

      res.json(data);
    }
  );
};

// UPDATE
const updateMember = (req, res) => {
  const { id } = req.params;
  const data = req.body;

  let image_url = data.image_url || null;

    if (req.file) {
    image_url = `http://localhost:5000/uploads/team/${req.file.filename}`;
    }

  const links = data.social_links
    ? JSON.stringify(JSON.parse(data.social_links))
    : null;

  const active =
    data.is_active === "true" || data.is_active === true ? 1 : 0;

  db.query(
    `UPDATE team_members SET
    name=?, role=?, description=?, image_url=?, social_links=?, display_order=?, is_active=?
    WHERE id=?`,
    [
      data.name,
      data.role,
      data.description,
      image_url,
      links,
      data.display_order,
      active,
      id,
    ],
    (err) => {
      if (err) return res.status(500).json({ message: "Update failed" });
      res.json({ message: "Updated" });
    }
  );
};

// DELETE
const deleteMember = (req, res) => {
  const { id } = req.params;

  // 1️⃣ Delete member
  db.query("DELETE FROM team_members WHERE id=?", [id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Delete failed" });
    }

    // 2️⃣ Reassign order (🔥 BEST APPROACH)
    db.query(
      `SET @count = 0`,
      () => {
        db.query(
          `UPDATE team_members 
           SET display_order = (@count := @count + 1)
           ORDER BY display_order`,
          (err) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ message: "Reorder failed" });
            }

            res.json({ message: "Deleted & reordered" });
          }
        );
      }
    );
  });
};

// TOGGLE
const toggleStatus = (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  db.query(
    "UPDATE team_members SET is_active=? WHERE id=?",
    [is_active, id],
    (err) => {
      if (err) return res.status(500).json({ message: "Error" });
      res.json({ message: "Updated" });
    }
  );
};

module.exports = {
  createMember,
  getMembers,
  updateMember,
  deleteMember,
  toggleStatus,
};