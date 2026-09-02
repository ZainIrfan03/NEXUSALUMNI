const express = require("express");
const {
  getMyProfile,
  updateMyProfile,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  uploadAvatarImage,
  uploadResumeFile,
} = require("../controllers/alumniProfileController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  uploadAvatar,
  uploadResume,
  validateFileSignature,
} = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validate");
const { ROLES } = require("../constants");
const { validateMongoIdParam } = require("../validators/paramValidators");
const {
  addEducationValidators,
  addExperienceValidators,
  updateProfileValidators,
} = require("../validators/profileValidators");
const router = express.Router();

router.get("/", protect, authorize(ROLES.ALUMNI), getMyProfile);
router.put(
  "/",
  protect,
  authorize(ROLES.ALUMNI),
  updateProfileValidators,
  validate,
  updateMyProfile,
);
router.post(
  "/experience",
  protect,
  authorize(ROLES.ALUMNI),
  addExperienceValidators,
  validate,
  addExperience,
);
router.delete(
  "/experience/:experienceId",
  protect,
  authorize(ROLES.ALUMNI),
  validateMongoIdParam("experienceId"),
  validate,
  deleteExperience,
);
router.post(
  "/education",
  protect,
  authorize(ROLES.ALUMNI),
  addEducationValidators,
  validate,
  addEducation,
);
router.post(
  "/avatar",
  protect,
  authorize(ROLES.ALUMNI),
  uploadAvatar.single("avatar"),
  validateFileSignature,
  uploadAvatarImage,
);
router.post(
  "/resume",
  protect,
  authorize(ROLES.ALUMNI),
  uploadResume.single("resume"),
  validateFileSignature,
  uploadResumeFile,
);
router.delete(
  "/education/:educationId",
  protect,
  authorize(ROLES.ALUMNI),
  validateMongoIdParam("educationId"),
  validate,
  deleteEducation,
);

module.exports = router;
