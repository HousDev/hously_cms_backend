const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  createService,
  getAllServices,
  getActiveServices,
  updateService,
  deleteService,
  toggleServiceStatus,
} = require("../controllers/serviceController");

router.post("/", upload.single("icon"), createService);
router.get("/", getAllServices);
router.get("/active", getActiveServices);
router.put("/:id", upload.single("icon"), updateService);
router.delete("/:id", deleteService);
router.patch("/:id/status", toggleServiceStatus);

module.exports = router;