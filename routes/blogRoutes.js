const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadBlog");

const {
  createBlog,
  getBlogs,
  updateBlog,
  deleteBlog,
  toggleStatus,
} = require("../controllers/blogController");

router.post("/", upload.single("image"), createBlog);
router.get("/", getBlogs);
router.put("/:id", upload.single("image"), updateBlog);
router.delete("/:id", deleteBlog);
router.patch("/:id/status", toggleStatus);

module.exports = router;