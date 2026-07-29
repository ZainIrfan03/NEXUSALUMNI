const express = require("express");
const { getStudentDirectory, getStudentById } = require("../controllers/alumniDirectoryController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("alumni"), getStudentDirectory);
router.get("/:id", protect, authorize("alumni"), getStudentById);

module.exports = router;