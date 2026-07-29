const express = require("express");
const {
  getMyJobs,
  deleteMyJob,
  getJobApplicants,
  updateApplicationStatus,
} = require("../controllers/alumniJobController");
const { protect, authorize } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", protect, authorize("alumni"), getMyJobs);
router.get("/:id/applicants", protect, authorize("alumni"), getJobApplicants);
router.patch(
  "/applications/:applicationId/status",
  protect,
  authorize("alumni"),
  updateApplicationStatus
);
router.delete("/:id", protect, authorize("alumni"), deleteMyJob);

module.exports = router;