const db = require("../config/db");

// CREATE BLOG
const createBlog = (req, res) => {

    console.log("BODY:", req.body);
console.log("FILE:", req.file);

  const {
    title,
    category_id,
    summary,
    read_time,
    tags,
    content,
    status,
  } = req.body;

  // VALIDATION
  if (!title) return res.status(400).json({ message: "Title required" });
  if (!category_id) return res.status(400).json({ message: "Category required" });
  if (!summary || summary.length < 20)
    return res.status(400).json({ message: "Summary min 20 chars" });
  if (!content || content.length < 50)
    return res.status(400).json({ message: "Content min 50 chars" });

  // IMAGE
  let image_url = "";

  if (req.file) {
    image_url = `http://localhost:5000/uploads/blogs/${req.file.filename}`;
  } else if (req.body.image_url) {
    image_url = req.body.image_url;
  } else {
    return res.status(400).json({ message: "Image required" });
  }

  const sql = `
    INSERT INTO blogs 
    (title, category_id, summary, read_time, tags, content, image_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, category_id, summary, read_time, tags, content, image_url, status || "draft"],
    (err) => {
      if (err) {
        console.log("DB ERROR:", err);
        return res.status(500).json({ message: "Error" });
      }
      res.json({ message: "Blog created" });
    }
  );
};

// GET ALL BLOGS
const getBlogs = (req, res) => {
  const sql = `
    SELECT b.*, c.name as category 
    FROM blogs b
    LEFT JOIN blog_categories c ON b.category_id = c.id
    ORDER BY b.created_at DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "DB Error" });
    res.json(result);
  });
};

// UPDATE BLOG
const updateBlog = (req, res) => {
  const { id } = req.params;
  const {
    title,
    category_id,
    summary,
    read_time,
    tags,
    content,
    status,
  } = req.body;

  let image_url = req.body.image_url;

  if (req.file) {
    image_url = `http://localhost:5000/uploads/blogs/${req.file.filename}`;
  }

  const sql = `
    UPDATE blogs 
    SET title=?, category_id=?, summary=?, read_time=?, tags=?, content=?, image_url=?, status=? 
    WHERE id=?
  `;

  db.query(
    sql,
    [title, category_id, summary, read_time, tags, content, image_url, status, id],
    (err) => {
      if (err) return res.status(500).json({ message: "Update failed" });
      res.json({ message: "Blog updated" });
    }
  );
};

// DELETE BLOG
const deleteBlog = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM blogs WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Delete failed" });
    res.json({ message: "Blog deleted" });
  });
};

// TOGGLE STATUS
const toggleStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.query(
    "UPDATE blogs SET status=? WHERE id=?",
    [status, id],
    (err) => {
      if (err) return res.status(500).json({ message: "Status update failed" });
      res.json({ message: "Status updated" });
    }
  );
};

module.exports = {
  createBlog,
  getBlogs,
  updateBlog,
  deleteBlog,
  toggleStatus,
};