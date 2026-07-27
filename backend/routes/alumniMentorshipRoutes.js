const express = require("express");
const {
  getMentorshipOverview,
  acceptRequest,
  rejectRequest,
} = require("../controllers/alumniMentorshipController");
const { protect, authorize } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", protect, authorize("alumni"), getMentorshipOverview);
router.post("/requests/:id/accept", protect, authorize("alumni"), acceptRequest);
router.post("/requests/:id/reject", protect, authorize("alumni"), rejectRequest);

module.exports = router;