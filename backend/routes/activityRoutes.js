const express = require("express");
const { getStudentActivity } = require("../controllers/activityController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("student"), getStudentActivity);

module.exports = router;