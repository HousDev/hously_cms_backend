const multer = require("multer");

// store in memory (best for parsing CSV)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/csv") {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed"), false);
  }
};

const uploadCSV = multer({
  storage,
  fileFilter,
});

module.exports = uploadCSV;