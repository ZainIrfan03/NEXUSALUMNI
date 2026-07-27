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
const router = express.Router();

router.get("/", protect, authorize("student"), getMyProfile);
router.put("/", protect, authorize("student"), updateMyProfile);

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

router.post("/experience", protect, authorize("student"), addExperience);
router.delete(
  "/experience/:experienceId",
  protect,
  authorize("student"),
  deleteExperience
);
router.post("/education", protect, authorize("student"), addEducation);
router.delete(
  "/education/:educationId",
  protect,
  authorize("student"),
  deleteEducation
);
module.exports = router;