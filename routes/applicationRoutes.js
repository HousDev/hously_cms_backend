const express = require("express");
const router = express.Router();

const uploadResume = require("../middleware/uploadResume");

const {
  createApplication,
  getApplications,
  updateStatus,
  deleteApplication,
  getStats,
} = require("../controllers/applicationController");

router.post("/", uploadResume.single("resume"), createApplication);
router.get("/", getApplications);
router.patch("/:id/status", updateStatus);
router.delete("/:id", deleteApplication);
router.get("/stats", getStats);

module.exports = router;