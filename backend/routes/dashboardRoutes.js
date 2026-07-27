const express = require("express");
const { getStudentOverview } = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("student"), getStudentOverview);

module.exports = router;