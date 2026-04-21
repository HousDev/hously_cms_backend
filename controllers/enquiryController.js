const db = require("../config/db");
const fs = require("fs");
const csv = require("csv-parser");
const { Readable } = require("stream");

// CREATE (website)
// CREATE (website)
const createEnquiry = (req, res) => {
  const { name, email, inquiry_type, service_required } = req.body;

  db.query(
    `INSERT INTO enquiries (name, email, inquiry_type, service_required)
     VALUES (?, ?, ?, ?)`,
    [name, email, inquiry_type, service_required],
    (err) => {
      if (err) return res.status(500).json({ message: "Error" });

      // ✅ STORE in DB (for offline admin)
      db.query(
        "INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)",
        [
          "New Enquiry",
          `New enquiry received from ${name}`,
          "enquiry",
        ],
        (err) => {
          if (err) console.log("❌ Notification DB error:", err);
        }
      );

      // ✅ REAL-TIME (if admin online)
      global.io.to("admin").emit("new_enquiry", {
        title: "New Enquiry",
        message: `New enquiry received from ${name}`,
        email,
        service: service_required,
        time: new Date(),
      });

      res.json({ message: "Enquiry added successfully" });
    }
  );
};
// const createEnquiry = (req, res) => {
//   const { name, email, inquiry_type, service_required } = req.body;

//   db.query(
//     `INSERT INTO enquiries (name, email, inquiry_type, service_required)
//      VALUES (?, ?, ?, ?)`,
//     [name, email, inquiry_type, service_required],
//     (err) => {
//       if (err) return res.status(500).json({ message: "Error" });

//       // admin offline that case
//       db.query(
//         "INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)",
//         [
//           "New Enquiry",
//           `New enquiry received from ${name}`,
//           "enquiry",
//         ]
//       );
//           // 🔔 Emit notification to admin
//       global.io.to("admin").emit("new_enquiry",
        
//         {
        
//         title: "New Enquiry",
//         message: `New enquiry received from ${name}`,
//         email: email,
//         service: service_required,
//         time: new Date(),
        
//       });

//       console.log("📢 Notification sent"); 
//     }
//   );
// };

const getEnquiries = (req, res) => {
  const { status, search, priority } = req.query; // ✅ ADD priority

  let sql = "SELECT * FROM enquiries WHERE 1=1";
  const params = [];

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  // ✅ ADD PRIORITY FILTER
  if (priority) {
    sql += " AND LOWER(priority) = LOWER(?)";
    params.push(priority);
  }

  if (search) {
    sql += " AND (name LIKE ? OR email LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += " ORDER BY created_at DESC";

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ message: "Error" });
    res.json(result);
  });
};

const updateStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.query(
    "UPDATE enquiries SET status=? WHERE id=?",
    [status, id],
    (err) => {
      if (err) return res.status(500).json({ message: "Error" });
     // 🔔 Emit notification to admin
      global.io.to("admin").emit("enquiry_status_updated", {
        title: "Enquiry Updated",
        message: `Enquiry #${id} status changed to ${status}`,
        status: status,
        time: new Date(),
      });
    }
  );
};

const updatePriority = (req, res) => {
  const { id } = req.params;
  const { priority } = req.body;

  db.query(
    "UPDATE enquiries SET priority=? WHERE id=?",
    [priority, id],
    (err) => {
      if (err) return res.status(500).json({ message: "Error" });
      res.json({ message: "Updated" });
    }
  );
};

const deleteEnquiry = (req, res) => {
  db.query(
    "DELETE FROM enquiries WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Error" });
      res.json({ message: "Deleted" });
    }
  );
};

const importCSV = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const results = [];

  // ✅ Convert buffer → stream
  const stream = Readable.from(req.file.buffer);

  stream
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {

      const sql = `
        INSERT INTO enquiries (name, email, inquiry_type, service_required)
        VALUES ?
      `;

      const values = results.map((r) => [
        r.Name || r.name,
        r.Email || r.email,
        r["Inquiry Type"] || r.inquiry_type,
        r.Service || r.service_required,
      ]);

      db.query(sql, [values], (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "DB Error" });
        }

        res.json({ message: "CSV Imported Successfully" });
      });
    })
    .on("error", (err) => {
      console.log(err);
      res.status(500).json({ message: "CSV Parse Error" });
    });
};

const exportCSV = (req, res) => {
  const { ids } = req.body;

  let sql = "SELECT * FROM enquiries";
  let params = [];

  if (ids && ids.length) {
    sql += ` WHERE id IN (?)`;
    params.push(ids);
  }

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ message: "Error" });

    let csv = "Name,Email,Inquiry Type,Service\n";

    rows.forEach((r) => {
      csv += `${r.name},${r.email},${r.inquiry_type},${r.service_required}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("enquiries.csv");
    return res.send(csv);
  });
};


const getStats = (req, res) => {
  const sql = `
    SELECT
      COUNT(*) as total,
      SUM(status='new') as new_count,
      SUM(status='in_progress') as in_progress,
      SUM(status='contacted') as contacted,
      SUM(status='converted') as converted,
      SUM(priority='urgent') as urgent,
      SUM(DATE(created_at)=CURDATE()) as today
    FROM enquiries
  `;

  db.query(sql, (err, result) => {
    res.json(result[0]);
  });
};


module.exports = {
  createEnquiry,
  getEnquiries,
  updateStatus,
  updatePriority,
  deleteEnquiry,
  importCSV,
  exportCSV,
  getStats
};
