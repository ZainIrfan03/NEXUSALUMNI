const express = require("express");
const {
  getRecommendedMentors,
  sendMentorshipRequest,
  getMyRequests,
} = require("../controllers/mentorshipController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { sendMentorshipRequestValidators } = require("../validators/mentorshipValidators");
const validate = require("../middleware/validate");
const { ROLES } = require("../constants");

const router = express.Router();

router.get("/recommended", protect, getRecommendedMentors);
router.post(
  "/request",
  protect,
  authorize(ROLES.STUDENT),
  sendMentorshipRequestValidators,
  validate,
  sendMentorshipRequest
);
router.get("/my-requests", protect, authorize(ROLES.STUDENT), getMyRequests);

module.exports = router;
