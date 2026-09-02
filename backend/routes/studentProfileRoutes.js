const express = require("express");
const {
  getMyProfile,
  updateMyProfile,
  uploadAvatarImage,
  uploadResumeFile,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
} = require("../controllers/studentProfileController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  uploadAvatar,
  uploadResume,
  validateFileSignature,
} = require("../middleware/uploadMiddleware");
const {
  updateProfileValidators,
  addExperienceValidators,
  addEducationValidators,
} = require("../validators/profileValidators");
const { validateMongoIdParam } = require("../validators/paramValidators");
const validate = require("../middleware/validate");
const { ROLES } = require("../constants");
const router = express.Router();

router.get("/", protect, authorize(ROLES.STUDENT), getMyProfile);
router.put("/", protect, authorize(ROLES.STUDENT), updateProfileValidators, validate, updateMyProfile);
router.post(
  "/avatar",
  protect,
  authorize(ROLES.STUDENT),
  uploadAvatar.single("avatar"),
  validateFileSignature,
  uploadAvatarImage
);
router.post(
  "/resume",
  protect,
  authorize(ROLES.STUDENT),
  uploadResume.single("resume"),
  validateFileSignature,
  uploadResumeFile
);

router.post(
  "/experience",
  protect,
  authorize(ROLES.STUDENT),
  addExperienceValidators,
  validate,
  addExperience
);
router.delete(
  "/experience/:experienceId",
  protect,
  authorize(ROLES.STUDENT),
  validateMongoIdParam("experienceId"),
  validate,
  deleteExperience
);
router.post(
  "/education",
  protect,
  authorize(ROLES.STUDENT),
  addEducationValidators,
  validate,
  addEducation
);
router.delete(
  "/education/:educationId",
  protect,
  authorize(ROLES.STUDENT),
  validateMongoIdParam("educationId"),
  validate,
  deleteEducation
);
module.exports = router;
