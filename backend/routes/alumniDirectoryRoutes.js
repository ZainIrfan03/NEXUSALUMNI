const express = require("express");
const { getStudentDirectory, getStudentById } = require("../controllers/alumniDirectoryController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateMongoIdParam } = require("../validators/paramValidators");
const validate = require("../middleware/validate");
const { ROLES } = require("../constants");

const router = express.Router();

router.get("/", protect, authorize(ROLES.ALUMNI), getStudentDirectory);
router.get("/:id", protect, authorize(ROLES.ALUMNI), validateMongoIdParam("id"), validate, getStudentById);

module.exports = router;
