const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadTestimonial");

const {
  createTestimonial,
  getTestimonials,
  updateTestimonial,
  deleteTestimonial,
  toggleStatus,
} = require("../controllers/testimonialController");

router.post("/", upload.single("image"), createTestimonial);
router.get("/", getTestimonials);
router.put("/:id", upload.single("image"), updateTestimonial);
router.delete("/:id", deleteTestimonial);
router.patch("/:id/status", toggleStatus);

module.exports = router;