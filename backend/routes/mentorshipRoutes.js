const express = require("express");
const {
  getRecommendedMentors,
  sendMentorshipRequest,
  getMyRequests,
} = require("../controllers/mentorshipController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { sendMentorshipRequestValidators } = require("../validators/mentorshipValidators");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/recommended", protect, getRecommendedMentors);
router.post(
  "/request",
  protect,
  authorize("student"),
  sendMentorshipRequestValidators,
  validate,
  sendMentorshipRequest
);
router.get("/my-requests", protect, authorize("student"), getMyRequests);

module.exports = router;