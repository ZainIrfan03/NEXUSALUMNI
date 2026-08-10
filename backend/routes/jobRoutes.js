const express = require("express");
const {
  getJobs,
  createJob,
  applyToJob,
  toggleSaveJob,
  getMyApplicationStats,
} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { createJobValidators } = require("../validators/jobValidators");
const { validateMongoIdParam } = require("../validators/paramValidators");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", protect, getJobs);
router.get("/my-applications", protect, authorize("student"), getMyApplicationStats);
router.post("/", protect, authorize("alumni"), createJobValidators, validate, createJob);
router.post(
  "/:id/apply",
  protect,
  authorize("student"),
  validateMongoIdParam("id"),
  validate,
  applyToJob
);
router.post(
  "/:id/save",
  protect,
  authorize("student"),
  validateMongoIdParam("id"),
  validate,
  toggleSaveJob
);

module.exports = router;