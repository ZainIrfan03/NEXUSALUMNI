const express = require("express");
const { getMyJobs, deleteMyJob } = require("../controllers/alumniJobController");
const { protect, authorize } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", protect, authorize("alumni"), getMyJobs);
router.delete("/:id", protect, authorize("alumni"), deleteMyJob);

module.exports = router;