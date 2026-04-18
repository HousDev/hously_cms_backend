const express = require("express");
const router = express.Router();

const {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  toggleStatus,
} = require("../controllers/jobController");

router.post("/", createJob);
router.get("/", getJobs);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);
router.patch("/:id/status", toggleStatus);

module.exports = router;