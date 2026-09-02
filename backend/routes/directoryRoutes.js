const express = require("express");
const { getFeaturedAlumni, getAlumniDirectory, getAlumniById } = require("../controllers/directoryController");
const { protect } = require("../middleware/authMiddleware");
const { validateMongoIdParam } = require("../validators/paramValidators");
const validate = require("../middleware/validate");

const router = express.Router();
router.get("/featured", getFeaturedAlumni);
router.get("/", protect, getAlumniDirectory);
router.get("/:id", protect, validateMongoIdParam("id"), validate, getAlumniById);

module.exports = router;