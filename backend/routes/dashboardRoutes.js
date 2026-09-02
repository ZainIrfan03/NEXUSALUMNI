const express = require("express");
const { getStudentOverview } = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../constants");

const router = express.Router();

router.get("/", protect, authorize(ROLES.STUDENT), getStudentOverview);

module.exports = router;
