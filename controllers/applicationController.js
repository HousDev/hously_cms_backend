const db = require("../config/db");

/* CREATE APPLICATION */
const createApplication = (req, res) => {
  const {
    jobId,
    fullName,
    email,
    phone,
    linkedin,
    portfolio,
    coverLetter,
  } = req.body;

  const resume = req.file ? req.file.filename : null;

  if (!jobId || !fullName || !email || !phone || !resume) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  const sql = `
    INSERT INTO applications
    (job_id, full_name, email, phone, linkedin, portfolio, cover_letter, resume)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [jobId, fullName, email, phone, linkedin, portfolio, coverLetter, resume],
    (err) => {
      if (err) return res.status(500).json({ message: "Error" });

      res.json({ message: "Application submitted" });
    }
  );
};
/* GET ALL */
const getApplications = (req, res) => {
  const { status, search } = req.query;

  let sql = `
    SELECT 
      a.*, 
      j.job_title 
    FROM applications a
    LEFT JOIN jobs j ON a.job_id = j.id
    WHERE 1=1
  `;

  const params = [];

  if (status && status !== "all") {
    sql += " AND a.status=?";
    params.push(status);
  }

  if (search) {
    sql += " AND (a.full_name LIKE ? OR a.email LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += " ORDER BY a.created_at DESC";

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

/* UPDATE STATUS */
const updateStatus = (req, res) => {
  db.query(
    "UPDATE applications SET status=? WHERE id=?",
    [req.body.status, req.params.id],
    () => res.json({ message: "Updated" })
  );
};

/* DELETE */
const deleteApplication = (req, res) => {
  db.query(
    "DELETE FROM applications WHERE id=?",
    [req.params.id],
    () => res.json({ message: "Deleted" })
  );
};

/* STATS */
const getStats = (req, res) => {
  const sql = `
    SELECT
      COUNT(*) total,
      SUM(status='pending') pending,
      SUM(status='reviewed') reviewed,
      SUM(status='shortlisted') shortlisted,
      SUM(status='rejected') rejected,
      SUM(status='hired') hired
    FROM applications
  `;

  db.query(sql, (err, result) => {
    res.json(result[0]);
  });
};

module.exports = {
  createApplication,
  getApplications,
  updateStatus,
  deleteApplication,
  getStats,
};