const express = require("express");
const { getAlumniOverview } = require("../controllers/alumniDashboardController");
const { protect, authorize } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", protect, authorize("alumni"), getAlumniOverview);

module.exports = router;