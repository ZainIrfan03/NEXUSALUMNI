const express = require("express");
const {
  getJobs,
  createJob,
  applyToJob,
  toggleSaveJob,
  getMyApplicationStats,
} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getJobs);
router.get("/my-applications", protect, authorize("student"), getMyApplicationStats);
router.post("/", protect, authorize("alumni"), createJob);
router.post("/:id/apply", protect, authorize("student"), applyToJob);
router.post("/:id/save", protect, authorize("student"), toggleSaveJob);

module.exports = router;