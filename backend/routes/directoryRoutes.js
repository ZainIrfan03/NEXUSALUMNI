const express = require("express");
const { getAlumniDirectory, getAlumniById } = require("../controllers/directoryController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Any logged-in user (student/alumni/faculty/admin) can browse the directory
router.get("/", protect, getAlumniDirectory);
router.get("/:id", protect, getAlumniById);

module.exports = router;