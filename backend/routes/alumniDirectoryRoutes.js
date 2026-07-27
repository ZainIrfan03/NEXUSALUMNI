const express = require("express");
const { getStudentDirectory } = require("../controllers/alumniDirectoryController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("alumni"), getStudentDirectory);

module.exports = router;