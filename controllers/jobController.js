const db = require("../config/db");

// CREATE JOB
const createJob = (req, res) => {

    console.log("BODY:", req.body);
  const {
    job_title,
    department_id,
    custom_department,
    location,
    job_type,
    salary_range,
    experience_level,
    vacancy_count,
    application_deadline,
    description,
    requirements,
    responsibilities,
    benefits,
    is_active,
  } = req.body;

  const deadline = application_deadline || null;

  if (!job_title) return res.status(400).json({ message: "Title required" });
  if (!location) return res.status(400).json({ message: "Location required" });
  if (!vacancy_count)
    return res.status(400).json({ message: "Vacancy required" });

  const sql = `
    INSERT INTO jobs
    (job_title, department_id, custom_department, location, job_type,
     salary_range, experience_level, vacancy_count, application_deadline,
     description, requirements, responsibilities, benefits, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      job_title,
      department_id || null,
      custom_department || null,
      location,
      job_type,
      salary_range,
      experience_level,
      vacancy_count,
      deadline,
      description,
      requirements,
      responsibilities,
      benefits,
      is_active ? 1 : 0,
    ],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error" });
      }
      res.json({ message: "Job created" });
    }
  );
};

// GET ALL JOBS
const getJobs = (req, res) => {
  const sql = `
    SELECT j.*, d.name as department
    FROM jobs j
    LEFT JOIN departments d ON j.department_id = d.id
    ORDER BY j.created_at DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Error" });
    res.json(result);
  });
};

// UPDATE
const updateJob = (req, res) => {
  const { id } = req.params;
  const data = req.body;

  // ✅ FIX DATE
  const deadline = data.application_deadline || null;

  // ✅ FIX BOOLEAN
  const isActive = data.is_active === "true" || data.is_active === true ? 1 : 0;

  // ✅ FIX FK
  const departmentId = data.department_id || null;

  const sql = `
    UPDATE jobs SET
    job_title=?, 
    department_id=?, 
    custom_department=?, 
    location=?, 
    job_type=?,
    salary_range=?, 
    experience_level=?, 
    vacancy_count=?, 
    application_deadline=?,
    description=?, 
    requirements=?, 
    responsibilities=?, 
    benefits=?, 
    is_active=?
    WHERE id=?
  `;

  db.query(
    sql,
    [
      data.job_title,
      departmentId,              // ✅ FIXED
      data.custom_department || null,
      data.location,
      data.job_type,
      data.salary_range,
      data.experience_level,
      Number(data.vacancy_count), // ✅ SAFE NUMBER
      deadline,                   // ✅ FIXED
      data.description,
      data.requirements,
      data.responsibilities,
      data.benefits,
      isActive,                   // ✅ FIXED
      id,
    ],
    (err) => {
      if (err) {
        console.log("UPDATE ERROR:", err); // 🔥 DEBUG
        return res.status(500).json({ message: "Update failed" });
      }
      res.json({ message: "Updated successfully" });
    }
  );
};

// DELETE
const deleteJob = (req, res) => {
  db.query("DELETE FROM jobs WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Delete failed" });
    res.json({ message: "Deleted" });
  });
};

// TOGGLE STATUS
const toggleStatus = (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  db.query(
    "UPDATE jobs SET is_active=? WHERE id=?",
    [is_active, id],
    (err) => {
      if (err) return res.status(500).json({ message: "Error" });
      res.json({ message: "Updated" });
    }
  );
};

module.exports = {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  toggleStatus,
};