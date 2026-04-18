const express = require("express");
const router = express.Router();
const { adminLogin, getProfile, updateProfile } = require("../controllers/adminController");

router.post("/login", adminLogin);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

module.exports = router;