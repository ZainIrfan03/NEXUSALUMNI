const express = require("express");
const {
  getMentorshipOverview,
  acceptRequest,
  rejectRequest,
} = require("../controllers/alumniMentorshipController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateMongoIdParam } = require("../validators/paramValidators");
const validate = require("../middleware/validate");
const { ROLES } = require("../constants");
const router = express.Router();

router.get("/", protect, authorize(ROLES.ALUMNI), getMentorshipOverview);
router.post(
  "/requests/:id/accept",
  protect,
  authorize(ROLES.ALUMNI),
  validateMongoIdParam("id"),
  validate,
  acceptRequest
);
router.post(
  "/requests/:id/reject",
  protect,
  authorize(ROLES.ALUMNI),
  validateMongoIdParam("id"),
  validate,
  rejectRequest
);

module.exports = router;
