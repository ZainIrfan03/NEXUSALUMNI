const express = require("express");
const {
  getMyJobs,
  deleteMyJob,
  getJobApplicants,
  updateApplicationStatus,
} = require("../controllers/alumniJobController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { updateApplicationStatusValidators } = require("../validators/alumniJobValidators");
const { validateMongoIdParam } = require("../validators/paramValidators");
const validate = require("../middleware/validate");
const router = express.Router();

router.get("/", protect, authorize("alumni"), getMyJobs);
router.get(
  "/:id/applicants",
  protect,
  authorize("alumni"),
  validateMongoIdParam("id"),
  validate,
  getJobApplicants
);
router.patch(
  "/applications/:applicationId/status",
  protect,
  authorize("alumni"),
  validateMongoIdParam("applicationId"),
  updateApplicationStatusValidators,
  validate,
  updateApplicationStatus
);
router.delete(
  "/:id",
  protect,
  authorize("alumni"),
  validateMongoIdParam("id"),
  validate,
  deleteMyJob
);

module.exports = router;