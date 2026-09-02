const express = require("express");
const { getAlumniOverview } = require("../controllers/alumniDashboardController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../constants");
const router = express.Router();

router.get("/", protect, authorize(ROLES.ALUMNI), getAlumniOverview);

module.exports = router;
