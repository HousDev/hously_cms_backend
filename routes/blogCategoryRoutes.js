const express = require("express");
const router = express.Router();

const { getCategories } = require("../controllers/blogCategoryController");

router.get("/", getCategories);

module.exports = router;