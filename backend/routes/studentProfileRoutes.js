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
const { uploadAvatar, uploadResume } = require("../middleware/uploadMiddleware");
const {
  updateProfileValidators,
  addExperienceValidators,
  addEducationValidators,
} = require("../validators/profileValidators");
const { validateMongoIdParam } = require("../validators/paramValidators");
const validate = require("../middleware/validate");
const router = express.Router();

router.get("/", protect, authorize("student"), getMyProfile);
router.put("/", protect, authorize("student"), updateProfileValidators, validate, updateMyProfile);

// Avatar/resume upload — multipart/form-data, handled by multer before the controller
router.post(
  "/avatar",
  protect,
  authorize("student"),
  uploadAvatar.single("avatar"),
  uploadAvatarImage
);
router.post(
  "/resume",
  protect,
  authorize("student"),
  uploadResume.single("resume"),
  uploadResumeFile
);

router.post(
  "/experience",
  protect,
  authorize("student"),
  addExperienceValidators,
  validate,
  addExperience
);
router.delete(
  "/experience/:experienceId",
  protect,
  authorize("student"),
  validateMongoIdParam("experienceId"),
  validate,
  deleteExperience
);
router.post(
  "/education",
  protect,
  authorize("student"),
  addEducationValidators,
  validate,
  addEducation
);
router.delete(
  "/education/:educationId",
  protect,
  authorize("student"),
  validateMongoIdParam("educationId"),
  validate,
  deleteEducation
);
module.exports = router;