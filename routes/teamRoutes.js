const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadTeam");

const {
  createMember,
  getMembers,
  updateMember,
  deleteMember,
  toggleStatus,
} = require("../controllers/teamController");

router.post("/", upload.single("image"), createMember);
router.get("/", getMembers);
router.put("/:id", upload.single("image"), updateMember);
router.delete("/:id", deleteMember);
router.patch("/:id/status", toggleStatus);

module.exports = router;