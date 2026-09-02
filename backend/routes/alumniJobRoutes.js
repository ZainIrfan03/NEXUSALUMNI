const express = require("express");
const {
  getMyJobs,
  deleteMyJob,
  getJobApplicants,
  updateApplicationStatus,
  scheduleInterview,
} = require("../controllers/alumniJobController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  updateApplicationStatusValidators,
  scheduleInterviewValidators,
} = require("../validators/alumniJobValidators");
const { validateMongoIdParam } = require("../validators/paramValidators");
const validate = require("../middleware/validate");
const { ROLES } = require("../constants");
const router = express.Router();

router.get("/", protect, authorize(ROLES.ALUMNI), getMyJobs);
router.get(
  "/:id/applicants",
  protect,
  authorize(ROLES.ALUMNI),
  validateMongoIdParam("id"),
  validate,
  getJobApplicants
);
router.patch(
  "/applications/:applicationId/interview",
  protect,
  authorize(ROLES.ALUMNI),
  validateMongoIdParam("applicationId"),
  scheduleInterviewValidators,
  validate,
  scheduleInterview
);
router.patch(
  "/applications/:applicationId/status",
  protect,
  authorize(ROLES.ALUMNI),
  validateMongoIdParam("applicationId"),
  updateApplicationStatusValidators,
  validate,
  updateApplicationStatus
);
router.delete(
  "/:id",
  protect,
  authorize(ROLES.ALUMNI),
  validateMongoIdParam("id"),
  validate,
  deleteMyJob
);

module.exports = router;
