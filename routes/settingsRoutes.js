const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadSettings");

const {
  getSettings,
  saveGeneral,
  saveAppearance,
} = require("../controllers/settingsController");

// GET
router.get("/", getSettings);

// GENERAL
router.post("/general", saveGeneral);

// APPEARANCE (MULTIPLE FILES)
router.post(
  "/appearance",
  upload.fields([
    { name: "navbar_logo" },
    { name: "footer_logo" },
    { name: "favicon" },
  ]),
  saveAppearance
);

module.exports = router;