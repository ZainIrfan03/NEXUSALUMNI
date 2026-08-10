const express = require("express");
const { getAlumniDirectory, getAlumniById } = require("../controllers/directoryController");
const { protect } = require("../middleware/authMiddleware");
const { validateMongoIdParam } = require("../validators/paramValidators");
const validate = require("../middleware/validate");

const router = express.Router();

// Any logged-in user (student/alumni/faculty/admin) can browse the directory
router.get("/", protect, getAlumniDirectory);
router.get("/:id", protect, validateMongoIdParam("id"), validate, getAlumniById);

module.exports = router;