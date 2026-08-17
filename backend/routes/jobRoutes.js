const express = require("express");
const {
  getJobs,
  createJob,
  applyToJob,
  toggleSaveJob,
  getMyApplications,
  respondToInterview,
} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { createJobValidators, interviewResponseValidators } = require("../validators/jobValidators");
const { validateMongoIdParam } = require("../validators/paramValidators");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", protect, getJobs);
router.get("/my-applications", protect, authorize("student"), getMyApplications);
router.post("/", protect, authorize("alumni"), createJobValidators, validate, createJob);
router.post(
  "/:id/apply",
  protect,
  authorize("student"),
  validateMongoIdParam("id"),
  validate,
  applyToJob
);
router.patch(
  "/applications/:applicationId/interview-response",
  protect,
  authorize("student"),
  validateMongoIdParam("applicationId"),
  interviewResponseValidators,
  validate,
  respondToInterview
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
