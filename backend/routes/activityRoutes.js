const express = require("express");
const {
  getStudentActivity,
} = require("../controllers/studentActivityController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../constants");

const router = express.Router();

router.get("/", protect, authorize(ROLES.STUDENT), getStudentActivity);

module.exports = router;
