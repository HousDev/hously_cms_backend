const express = require("express");
const router = express.Router();
const db = require("../config/db");
const uploadCSV = require("../middleware/uploadCSV");


const { createEnquiry, getEnquiries, updateStatus,updatePriority, deleteEnquiry, importCSV, exportCSV, getStats } = require("../controllers/enquiryController");

router.post("/", createEnquiry);
router.get("/", getEnquiries);
router.patch("/:id/status", updateStatus);
router.patch("/:id/priority", updatePriority);
router.delete("/:id", deleteEnquiry);
router.get("/stats", getStats);

router.post("/import", uploadCSV.single("file"), importCSV);
router.post("/export", exportCSV);


module.exports = router;