const express = require("express");
const { getFeaturedAlumni, getAlumniDirectory, getAlumniById } = require("../controllers/directoryController");
const { protect } = require("../middleware/authMiddleware");
const { validateMongoIdParam } = require("../validators/paramValidators");
const validate = require("../middleware/validate");

const router = express.Router();

// Public — no login required. Used by the marketing Home page.
// Must be registered before "/:id" or Express would match "featured" as an id.
router.get("/featured", getFeaturedAlumni);

// Any logged-in user (student/alumni/faculty/admin) can browse the directory
router.get("/", protect, getAlumniDirectory);
router.get("/:id", protect, validateMongoIdParam("id"), validate, getAlumniById);

module.exports = router;