const express = require("express");
const { getStudentDirectory, getStudentById } = require("../controllers/alumniDirectoryController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateMongoIdParam } = require("../validators/paramValidators");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", protect, authorize("alumni"), getStudentDirectory);
router.get("/:id", protect, authorize("alumni"), validateMongoIdParam("id"), validate, getStudentById);

module.exports = router;