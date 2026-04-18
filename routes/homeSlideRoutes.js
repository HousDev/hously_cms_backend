// routes/homeSlideRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadHomeSlide");
// const upload = require("../middleware/upload");

const {
  createSlide,
  getAllSlides,
  getActiveSlides,
  updateSlide,
  deleteSlide,
  toggleStatus
} = require("../controllers/homeSlideController");

// Routes
// router.post("/", upload.single("image"), createSlide);
//router.get("/", getSlides);
router.post("/", upload.single("image"), createSlide);
router.get("/active", getActiveSlides);
router.put("/:id", upload.single("image"), updateSlide);
router.delete("/:id", deleteSlide);
router.patch("/:id/status", toggleStatus);
router.get("/", getAllSlides);

module.exports = router;